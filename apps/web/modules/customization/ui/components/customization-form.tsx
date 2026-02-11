import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { VapiFormFields } from "./vapi-form-fields";
import { widgetSettingsSchema } from "../../schemas";
import { FormSchema } from "../../types";


type WidgetSettings = Doc<"widgetSettings">;

interface CustomizationFormProps {
  initialData?: WidgetSettings | null;
  hasVapiPlugin: boolean;
}

export const CustomizationForm = ({
  initialData,
  hasVapiPlugin,
}: CustomizationFormProps) => {
  const upsertWidgetSettings = useMutation(api.private.widgetSettings.upsert);

  const form = useForm<FormSchema>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues: {
      greetMessage:
        initialData?.greetMessage || "Hi! How can I help you today?",
      defaultSuggestions: {
        suggestions1: initialData?.defaultSuggestions?.suggestions1?.[0] || "",
        suggestions2: initialData?.defaultSuggestions?.suggestions2?.[0] || "",
        suggestions3: initialData?.defaultSuggestions?.suggestions3?.[0] || "",
      },
      vapiSettings: {
        assistantId: initialData?.vapiSettings?.assistantId || "",
        phoneNumber: initialData?.vapiSettings?.phoneNumber || "",
      },
    },
  });

  const onSubmit = async (values: FormSchema) => {
    try {
      const vapiSettings = {
        assistantId:
          values.vapiSettings.assistantId === "none"
            ? ""
            : values.vapiSettings.assistantId,
        phoneNumber:
          values.vapiSettings.phoneNumber === "none"
            ? ""
            : values.vapiSettings.phoneNumber,
      };
      const defaultSuggestions = {
        suggestions1: values.defaultSuggestions.suggestions1
          ? [values.defaultSuggestions.suggestions1]
          : [],
        suggestions2: values.defaultSuggestions.suggestions2
          ? [values.defaultSuggestions.suggestions2]
          : [],
        suggestions3: values.defaultSuggestions.suggestions3
          ? [values.defaultSuggestions.suggestions3]
          : [],
      };

      await upsertWidgetSettings({
        greetMessage: values.greetMessage,
        defaultSuggestions,
        vapiSettings,
      });
      toast.success("Widget settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update widget settings");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>General Chat Settings</CardTitle>
            <CardDescription>
              These settings will be used to configure the chat widget and
              messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="greetMessage"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Greeting Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Welcome message shown when chat is opened"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    This message will be shown when the customer opens the chat
                    widget.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="mb-4 text-sm">Default Suggestions</h3>
                <p>
                  Quick reply suggestions shown to customers to help guide the
                  conversation
                </p>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="defaultSuggestions.suggestions1"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Suggestion 1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., How do I get started?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultSuggestions.suggestions2"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Suggestion 2</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., What are your pricing plans?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultSuggestions.suggestions3"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Suggestion 3</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., I need help with my account"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {hasVapiPlugin && (
            <Card>
                <CardHeader>
                    <CardTitle>Voice Assistant Settings</CardTitle>
                    <CardDescription>
                        Configure voice calling features powered by Vapi
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <VapiFormFields form={form} />
                </CardContent>
            </Card>
        )}
        <div className="flex justify-end">
            <Button disabled={form.formState.isSubmitting} type="submit">
                Save Settings
            </Button>
        </div>
      </form>
    </Form>
  );
};
