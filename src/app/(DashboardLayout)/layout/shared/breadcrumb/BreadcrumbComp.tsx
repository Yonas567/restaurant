import Link from 'next/link'

interface BreadcrumbItem {
  to?: string
  title: string
}

interface BreadcrumbCompProps {
  title: string
  items?: BreadcrumbItem[]
}

const BreadcrumbComp = ({ title, items = [] }: BreadcrumbCompProps) => {
  return (
    <div className='mb-6 flex flex-col gap-2'>
      <h1 className='text-2xl font-semibold'>{title}</h1>
      {items.length > 0 ? (
        <nav className='text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            {items.map((item, index) => (
              <span key={`${item.title}-${index}`} className='flex items-center gap-2'>
                {item.to ? (
                  <Link href={item.to} className='hover:text-primary'>
                    {item.title}
                  </Link>
                ) : (
                  <span>{item.title}</span>
                )}
                {index < items.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  )
}

export default BreadcrumbComp
