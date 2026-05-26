import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const merchantId  = formData.get('merchant_id') as string
  const orderId     = formData.get('order_id') as string
  const payhereAmount = formData.get('payhere_amount') as string
  const payhereCurrency = formData.get('payhere_currency') as string
  const statusCode  = formData.get('status_code') as string
  const md5sig      = formData.get('md5sig') as string

  const secret = process.env.PAYHERE_SECRET!
  const hash = crypto
    .createHash('md5')
    .update(
      merchantId +
      orderId +
      payhereAmount +
      payhereCurrency +
      statusCode +
      crypto.createHash('md5').update(secret).digest('hex').toUpperCase()
    )
    .digest('hex')
    .toUpperCase()

  if (hash !== md5sig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (statusCode === '2') {
    await prisma.booking.update({
      where:  { id: orderId },
      data:   { status: 'CONFIRMED', paymentRef: formData.get('payment_id') as string },
    })
  }

  return NextResponse.json({ received: true })
}
