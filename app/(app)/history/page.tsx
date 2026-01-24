import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "./copy-button";
import type { Conversion, Output, User } from "@/types/database";
import type { PlanType } from "@/lib/config/plans";

// Disable caching - always fetch fresh user data
export const dynamic = "force-dynamic";

interface ConversionWithOutputs extends Conversion {
  outputs: Output[];
}

const formatLabels = {
  x_thread: "Hilo de X",
  linkedin_post: "Post de LinkedIn",
  linkedin_article: "Articulo",
};

const inputTypeLabels = {
  youtube: "YouTube",
  article: "Articulo",
  text: "Texto",
};

const toneLabels = {
  profesional: "Profesional",
  cercano: "Cercano",
  tecnico: "Tecnico",
};

const PAGE_SIZE = 10;

interface HistoryPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's plan
  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single<Pick<User, "plan">>();

  const userPlan: PlanType = userData?.plan || "free";

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from("conversions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get user's conversions with outputs (paginated)
  const { data: conversions, error } = await supabase
    .from("conversions")
    .select(`
      *,
      outputs (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Error fetching conversions:", error);
  }

  const conversionList = (conversions as ConversionWithOutputs[]) || [];
  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
          Historial
        </h1>
        <Link
          href="/dashboard"
          className="btn-primary text-sm"
        >
          Nueva conversion
        </Link>
      </div>

      {conversionList.length === 0 && currentPage === 1 ? (
        <div className="card text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h2 className="font-heading text-lg font-semibold text-navy mb-2">
            Sin conversiones todavia
          </h2>
          <p className="text-gray-500 mb-6">
            Tus conversiones apareceran aqui una vez que empieces a crear contenido.
          </p>
          <Link
            href="/dashboard"
            className="btn-primary"
          >
            Crear mi primera conversion
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {conversionList.map((conversion) => (
              <ConversionCard key={conversion.id} conversion={conversion} userPlan={userPlan} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100"
              aria-label="Paginacion del historial"
            >
              <p className="text-sm text-gray-500">
                Pagina {currentPage} de {totalPages} ({totalCount} conversiones)
              </p>
              <div className="flex gap-2">
                {hasPrevPage ? (
                  <Link
                    href={`/history?page=${currentPage - 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-navy bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-lg cursor-not-allowed">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                  </span>
                )}
                {hasNextPage ? (
                  <Link
                    href={`/history?page=${currentPage + 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-navy bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Siguiente
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-lg cursor-not-allowed">
                    Siguiente
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function ConversionCard({ conversion, userPlan }: { conversion: ConversionWithOutputs; userPlan: PlanType }) {
  const date = new Date(conversion.created_at);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get the latest version of each output format
  const latestOutputs = conversion.outputs.reduce(
    (acc, output) => {
      if (!acc[output.format] || output.version > acc[output.format].version) {
        acc[output.format] = output;
      }
      return acc;
    },
    {} as Record<string, Output>
  );

  // Get preview text from input
  const previewText = conversion.input_text.length > 150
    ? conversion.input_text.substring(0, 150) + "..."
    : conversion.input_text;

  return (
    <article className="card hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header with type and date */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {inputTypeLabels[conversion.input_type]}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {toneLabels[conversion.tone]}
            </span>
            {conversion.topics && conversion.topics.length > 0 && (
              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {conversion.topics.length} tema{conversion.topics.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Source URL or preview */}
          {conversion.input_url ? (
            <a
              href={conversion.input_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-dark truncate block mb-2"
              aria-label={`Abrir ${conversion.input_url} en nueva ventana`}
            >
              {conversion.input_url}
            </a>
          ) : (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {previewText}
            </p>
          )}

          {/* Output formats */}
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(latestOutputs).map(([format, output]) => (
              <OutputPreview
                key={format}
                format={format as Output["format"]}
                output={output}
                userPlan={userPlan}
              />
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="text-right sm:text-right text-sm text-gray-500 flex-shrink-0">
          <time dateTime={conversion.created_at}>
            <p>{formattedDate}</p>
            <p>{formattedTime}</p>
          </time>
        </div>
      </div>
    </article>
  );
}

function OutputPreview({ format, output, userPlan }: { format: Output["format"]; output: Output; userPlan: PlanType }) {
  const preview = output.content.length > 80
    ? output.content.substring(0, 80) + "..."
    : output.content;

  return (
    <details className="group w-full">
      <summary className="cursor-pointer flex items-center gap-2 text-sm text-navy hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
        <svg
          className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium">{formatLabels[format]}</span>
        {output.version > 1 && (
          <span className="text-xs text-gray-400">(v{output.version})</span>
        )}
      </summary>
      <div className="mt-2 ml-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{preview}</p>
        <CopyButton content={output.content} format={format} plan={userPlan} />
      </div>
    </details>
  );
}
