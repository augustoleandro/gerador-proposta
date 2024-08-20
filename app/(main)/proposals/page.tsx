import { Proposal } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Proposal[]> {
  const supabase = createClient();

  const { data, error } = await supabase.from("proposals").select("*");

  if (!data) {
    return [];
  }

  const proposals = await Promise.all(
    data.map(async (proposal) => {
      const { data: user } = await supabase
        .from("users")
        .select("first_name")
        .eq("id", proposal.created_by)
        .single();

      const categories = await Promise.all(
        proposal.categories.map(async (category: number) => {
          const { data } = await supabase
            .from("categories")
            .select("*")
            .eq("id", category)
            .single();

          return data?.name || "";
        })
      );

      console.log(categories);

      return {
        ...proposal,
        created_at: formatDate(proposal.created_at || ""),
        total_value: formatCurrency(proposal.total_value || ""),
        created_by: user?.first_name || "",
        categories: categories,
      };
    })
  );

  return proposals;
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
