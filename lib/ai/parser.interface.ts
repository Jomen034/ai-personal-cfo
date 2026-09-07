export interface ParsedTransaction {
  transaction_type: "income" | "expense" | "transfer";
  amount: number;
  merchant?: string;
  category_id?: string;
  account_id?: string;
  destination_account_id?: string;
  transfer_type?: "internal" | "external" | null;
  transaction_date: string;
  confidence: number;
  raw_input: string;
}

export interface TransactionParser {
  parse(input: string, householdId: string): Promise<ParsedTransaction>;
}
