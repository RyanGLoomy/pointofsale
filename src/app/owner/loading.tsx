import { PageSkeleton, ShellSkeleton } from "@/components/ui/skeleton"

export default function OwnerLoading() {
  return (
    <ShellSkeleton>
      <PageSkeleton />
    </ShellSkeleton>
  )
}
