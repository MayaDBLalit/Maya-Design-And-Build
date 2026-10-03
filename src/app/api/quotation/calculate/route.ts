import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateAuthoritativeQuotation } from "@/lib/quotation";

const calculateRequestSchema = z.object({
  items: z
    .array(
      z.object({
        rateId: z.number().int().positive("Invalid rate ID"),
        quantity: z.number().min(0, "Quantity must be greater than or equal to 0"),
      })
    )
    .min(1, "At least one item must be submitted for calculation"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = calculateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { items } = validation.data;
    const result = await calculateAuthoritativeQuotation(items);

    return NextResponse.json({
      success: true,
      lineItems: result.lineItems,
      total: result.total,
      formattedTotal: result.formattedTotal,
      disclaimer:
        "Estimated Quotation — Final scope and commercial terms are subject to physical site inspection and executed engineering agreement by MAYA Design & Build.",
    });
  } catch (error) {
    console.error("Quotation calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to process quotation calculation",
      },
      { status: 500 }
    );
  }
}
