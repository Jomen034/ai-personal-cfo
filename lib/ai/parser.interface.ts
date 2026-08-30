export interface ParsedTransaction {
  transaction_type: "income" | "expense";
  amount: number;
  merchant?: string;
  category_id?: string;
  account_id?: string;
  transaction_date: string;
  confidence: number;
  raw_input: string;
}

export interface TransactionParser {
  parse(input: string, householdId: string): Promise<ParsedTransaction>;
}
