import { ArrowLeftRightIcon, type LucideIcon, PlugIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";

export interface Features {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface PluginCardProps {
  isDisabled?: boolean;
  serviceName: string;
  features: Features[];
  serviceImage: string;
  onSubmit: () => void;
}

export const PluginCard = ({
  isDisabled,
  serviceName,
  features,
  serviceImage,
  onSubmit,
}: PluginCardProps) => {
    return (
        <div className="h-fit w-full rounded-lg border bg-background p-8">
            <div className="mb-6 flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                    <Image 
                        src={serviceImage}
                        alt={serviceName}
                        width={40}
                        height={40}
                        className="rounded object-contain"
                    />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <ArrowLeftRightIcon />
                </div>
                <div className="flex flex-col items-center">
                    <Image 
                        src="/logo.svg"
                        alt="Platform"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                </div>
            </div>
            <div className="mb-6 text-center">
                <p className="text-lg">
                    Connect your {serviceName} account to Deskpilot
                </p>
            </div>
            <div className="mb-6">
                <div className="space-y-4">
                    {features.map((feature) => (
                        <div className="flex items-center gap-2" key={feature.title}>
                            <div className="flex size-8 items-center justify-center rounded-lg border bg-muted">
                                <feature.icon className="size-4 text-muted-foreground"/>
                            </div>
                            <div>
                                <div className="text-sm font-medium">{feature.title}</div>
                                <div className="text-xs text-muted-foreground">{feature.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <Button 
                    className="size-full"
                    onClick={onSubmit}
                    disabled={isDisabled}
                    variant="default"
                >
                    Connect
                    <PlugIcon />
                </Button>
            </div>
        </div>
    )
};
