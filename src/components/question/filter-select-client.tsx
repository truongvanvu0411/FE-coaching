"use client";

import { useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterSelectClient({
  label,
  current,
  options,
  allLabel,
  paramKey,
  baseParams,
  basePath,
}: {
  label: string;
  current?: string;
  options: { value: string; label: string }[];
  allLabel: string;
  // Server Components can only pass serializable props, so the href is built here
  // from the current query params rather than via a callback.
  paramKey: string;
  baseParams: Record<string, string>;
  basePath: string;
}) {
  const router = useRouter();
  const labelId = `filter-${paramKey}-label`;
  const triggerId = `filter-${paramKey}`;
  const selectedLabel = (value: string | null) =>
    value === "__all__"
      ? allLabel
      : options.find((option) => option.value === value)?.label ?? value ?? allLabel;

  const buildHref = (value?: string) => {
    const params = new URLSearchParams(baseParams);
    if (value) params.set(paramKey, value);
    else params.delete(paramKey);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="space-y-1.5">
      <label id={labelId} htmlFor={triggerId} className="text-sm font-medium">{label}</label>
      <Select
        value={current ?? "__all__"}
        onValueChange={(value) =>
          router.push(buildHref(!value || value === "__all__" ? undefined : value))
        }
      >
        <SelectTrigger id={triggerId} aria-labelledby={labelId} className="w-full">
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
