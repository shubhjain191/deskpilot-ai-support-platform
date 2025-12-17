import { WidgetView } from "@/modules/widget/ui/views/widget-view";
import type { JSX } from "react";

interface PageProps {
  searchParams: Promise<{
    organizationId: string;
  }>;
}

const Page = async ({ searchParams }: PageProps): Promise<JSX.Element> => {
  const { organizationId } = await searchParams;

  return <WidgetView organizationId={organizationId} />;
};

export default Page;
