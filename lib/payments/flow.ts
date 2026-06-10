import crypto from 'crypto'

/**
 * Flow Payment Gateway Integration
 * Uses real Flow API if FLOW_API_KEY is present, otherwise falls back to a Mock implementation.
 */

const API_KEY = process.env.FLOW_API_KEY
const SECRET = process.env.FLOW_SECRET
const BASE_URL = process.env.FLOW_BASE_URL || 'https://sandbox.flow.cl/api'

// We will use a simple internal secret to sign our mock tokens if real API is missing
const MOCK_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-mock-secret'

interface FlowPaymentResponse {
  url: string
  token: string
}

interface FlowStatusResponse {
  status: number // 1: Pending, 2: Paid, 3: Rejected, 4: Canceled
  amount: number
  paymentData?: any
}

export async function createPayment(params: {
  amount: number
  email: string
  subject: string
  commerceOrder: string
  returnUrl: string
}): Promise<FlowPaymentResponse> {
  // If no API key, use Mock Payment
  if (!API_KEY) {
    console.warn('⚠️ No FLOW_API_KEY found. Using Mock Payment Gateway.')
    // Generate a secure mock token containing the order info
    const data = JSON.stringify({
      order: params.commerceOrder,
      amount: params.amount,
      exp: Date.now() + 1000 * 60 * 15 // 15 mins expiry
    })
    const signature = crypto.createHmac('sha256', MOCK_SECRET).update(data).digest('hex')
    const token = Buffer.from(JSON.stringify({ data, signature })).toString('base64url')
    
    // Redirect to our internal mock payment page
    return {
      url: `/mock-flow-payment`,
      token
    }
  }

  // --- Real Flow Implementation ---
  const body = {
    apiKey: API_KEY,
    commerceOrder: params.commerceOrder,
    subject: params.subject,
    currency: 'CLP',
    amount: params.amount,
    email: params.email,
    paymentMethod: 9, // All means
    urlConfirmation: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/flow/webhook`,
    urlReturn: params.returnUrl,
  }

  // Calculate signature
  const keys = Object.keys(body).sort()
  const toSign = keys.map((k) => `${k}=${(body as any)[k]}`).join('&')
  const s = crypto.createHmac('sha256', SECRET!).update(toSign).digest('hex')

  const res = await fetch(`${BASE_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(
      Object.fromEntries(
        Object.entries({ ...body, s }).map(([k, v]) => [k, String(v)])
      )
    ).toString()
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Flow API Error: ${error}`)
  }

  const data = await res.json()
  return {
    url: data.url,
    token: data.token
  }
}

export async function getPaymentStatus(token: string): Promise<FlowStatusResponse> {
  if (!API_KEY) {
    // Mock Validation
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
      const expectedSignature = crypto.createHmac('sha256', MOCK_SECRET).update(decoded.data).digest('hex')
      if (expectedSignature !== decoded.signature) {
        throw new Error('Invalid mock signature')
      }
      const parsedData = JSON.parse(decoded.data)
      if (parsedData.exp < Date.now()) {
        return { status: 4, amount: parsedData.amount } // Cancelled/Expired
      }
      return { status: 2, amount: parsedData.amount } // Always Paid in mock for simplicity
    } catch (e) {
      return { status: 3, amount: 0 } // Rejected
    }
  }

  // --- Real Flow Implementation ---
  const toSign = `apiKey=${API_KEY}&token=${token}`
  const s = crypto.createHmac('sha256', SECRET!).update(toSign).digest('hex')

  const res = await fetch(`${BASE_URL}/payment/getStatus?apiKey=${API_KEY}&token=${token}&s=${s}`)
  if (!res.ok) {
    throw new Error('Failed to get payment status from Flow')
  }

  const data = await res.json()
  return {
    status: data.status,
    amount: data.amount,
    paymentData: data
  }
}
