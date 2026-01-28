
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface ConversationStatusIconProps {
  status: "unresolved" | "escalated" | "resolved";
  className?: string;
}

export const ConversationStatusIcon = ({
  status,
  className,
}: ConversationStatusIconProps) => {
  return (
    <div
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-white",
        status === "unresolved" && "bg-orange-500",
        status === "escalated" && "bg-red-500",
        status === "resolved" && "bg-green-500",
        className
      )}
    >
      {status === "unresolved" && <ArrowRightIcon className="size-3" />}
      {status === "escalated" && <ArrowUpIcon className="size-3" />}
      {status === "resolved" && <CheckIcon className="size-3" />}
    </div>
  );
};
