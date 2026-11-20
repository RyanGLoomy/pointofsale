import { PageSkeleton, ShellSkeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <ShellSkeleton>
      <PageSkeleton />
    </ShellSkeleton>
  )
}
