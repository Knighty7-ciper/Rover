import Link from "next/link"

interface RenderedContentProps {
  content: string
}

export function RenderedContent({ content }: RenderedContentProps) {
  const regex = /(@[\w_]+|#\w+)/g
  const parts = content.split(regex)

  return (
    <p className="whitespace-pre-wrap text-foreground">
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          const username = part.slice(1).replace(/_/g, " ")
          return (
            <Link
              key={index}
              href={`/profile/${encodeURIComponent(username)}`}
              className="font-medium text-primary hover:underline"
            >
              {part}
            </Link>
          )
        } else if (part.startsWith("#")) {
          const tag = part.slice(1)
          return (
            <Link key={index} href={`/tag/${tag}`} className="font-medium text-primary hover:underline">
              {part}
            </Link>
          )
        }
        return part
      })}
    </p>
  )
}
