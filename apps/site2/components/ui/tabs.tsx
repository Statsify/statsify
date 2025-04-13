/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Box } from "~/components/ui/box";
import { type ComponentProps, createContext, use, useState } from "react";
import { cn } from "~/lib/util";

const TabsContext = createContext<{ tab: string | number; onTabChange: (tab: string | number) => void }>({
  tab: "",
  onTabChange: () => {},
});

type TabsProps<T extends string | number> = ({
  tab: T;
  onTabChange: (tab: T) => void;
  defaultTab?: T;
} | {
  tab?: T;
  onTabChange?: (tab: T) => void;
  defaultTab: T;
}) & ComponentProps<"div">;

export function Tabs<T extends string | number>({
  tab: externalTab,
  onTabChange: externalOnTabChange,
  defaultTab,
  className,
  ...props
}: TabsProps<T>) {
  const [internalTab, setInternalTab] = useState(defaultTab as T);

  function onTabChange(tab: T) {
    setInternalTab(tab);
    externalOnTabChange?.(tab);
  }

  const tab = externalTab ?? internalTab;

  return (
    <TabsContext value={{ tab, onTabChange: onTabChange as (tab: string | number) => void }}>
      <div {...props} className={cn("grid auto-cols-[1fr] grid-flow-col gap-4 items-center justify-center text-center", className)} />
    </TabsContext>
  );
}

type TabProps = {
  tab: string | number;
} & Omit<ComponentProps<typeof Box<"button">>, "borderRadius">;

export function Tab({ tab, onClick, containerClass = "", contentClass = "", ...props }: TabProps) {
  const { tab: activeTab, onTabChange } = use(TabsContext);

  return (
    <Box
      {...props}

      as="button"
      aria-pressed={activeTab === tab}
      onClick={(event) => {
        onTabChange(tab);
        onClick?.(event);
      }}

      borderRadius={{ bottom: 0 }}
      containerClass={`group text-mc-gray aria-pressed:font-bold aria-pressed:text-mc-white transition-colors  ${containerClass}`}
      contentClass={`flex items-center justify-center gap-2 ${contentClass}`}
    />
  );
}
