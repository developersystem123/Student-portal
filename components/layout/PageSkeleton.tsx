import { Card, CardBody, Skeleton } from "@/components/ui";

/**
 * Route-level loading fallback. Rendered instantly on navigation (via the
 * `loading.tsx` Suspense boundary) so a clicked page opens with immediate
 * visual feedback while its content streams in.
 */
export default function PageSkeleton() {
  return (
    <div className="space-y-6 fade-in">
      {/* Page header */}
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>

      {/* Main content card */}
      <Card>
        <CardBody className="space-y-4">
          <Skeleton className="h-11 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
