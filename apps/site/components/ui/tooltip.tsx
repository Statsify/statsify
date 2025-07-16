/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Caret } from "../icons/caret";
import { type ComponentProps, type ReactNode, useState } from "react";

export function PopoverTooltip({
  children,
  asChild,
  content,
  open: externalOpen,
  defaultOpen = false,
  onOpenChange: externalOnOpenChange,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Root> & {
  children: ReactNode;
  asChild?: boolean;
  content: string;
}) {
  const [internalOpen, internalSetOpen] = useState(defaultOpen);
  const open = externalOpen ?? internalOpen;

  function onOpenChange(open: boolean) {
    externalOnOpenChange?.(open);
    internalSetOpen(open);
  }

  return (
    <PopoverPrimitive.Root
      {...props}
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
    >
      <PopoverPrimitive.Trigger asChild={asChild}>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          className="relative group drop-shadow-mc-4 text-blackify-800/50 data-[side=left]:mr-3 data-[side=right]:ml-3 data-[side=top]:mb-2 data-[side=bottom]:mt-2 data-[state=open]:data-[side=top]:animate-slide-in-up-and-fade  data-[state=open]:data-[side=bottom]:animate-slide-in-down-and-fade  data-[state=open]:data-[side=left]:animate-slide-in-left-and-fade  data-[state=open]:data-[side=right]:animate-slide-in-right-and-fade  data-[state=closed]:data-[side=top]:animate-slide-out-down-and-fade  data-[state=closed]:data-[side=bottom]:animate-slide-out-up-and-fade  data-[state=closed]:data-[side=left]:animate-slide-out-right-and-fade  data-[state=closed]:data-[side=right]:animate-slide-out-left-and-fade "
        >
          <Caret className="absolute text-blackify-800 group-data-[side=left]:-right-2 group-data-[side=left]:top-1/2 group-data-[side=left]:-translate-y-1/2 group-data-[side=right]:rotate-180 group-data-[side=right]:-left-2 group-data-[side=right]:top-1/2 group-data-[side=right]:-translate-y-1/2 group-data-[side=bottom]:rotate-270 group-data-[side=bottom]:left-1/2 group-data-[side=bottom]:-translate-x-1/2 group-data-[side=bottom]:-top-2 group-data-[side=top]:rotate-90 group-data-[side=top]:left-1/2 group-data-[side=top]:-translate-x-1/2 group-data-[side=top]:-bottom-2" />
          <div className="relative text-mc-2 text-mc-white bg-blackify-800 z-50 p-2">
            {content}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
