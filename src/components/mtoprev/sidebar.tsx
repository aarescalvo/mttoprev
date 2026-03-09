'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Wrench,
  Users,
  ClipboardList,
  CalendarClock,
  Building2,
  FileBarChart,
  Settings,
  ChevronDown,
  ChevronRight,
  Factory,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    title: 'Stock de Materiales',
    href: '/stock',
    icon: <Package className="h-4 w-4" />
  },
  {
    title: 'Herramientas',
    href: '/herramientas',
    icon: <Wrench className="h-4 w-4" />
  },
  {
    title: 'Personal',
    href: '/personal',
    icon: <Users className="h-4 w-4" />
  },
  {
    title: 'Solicitudes',
    href: '/solicitudes',
    icon: <ClipboardList className="h-4 w-4" />
  },
  {
    title: 'Mantenimiento Preventivo',
    href: '/mantenimientos',
    icon: <CalendarClock className="h-4 w-4" />
  },
  {
    title: 'Centro de Costos',
    href: '/centros-costo',
    icon: <Building2 className="h-4 w-4" />
  },
  {
    title: 'Reportes',
    href: '/reportes',
    icon: <FileBarChart className="h-4 w-4" />
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleItem = (title: string) => {
    setOpenItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: SidebarItem) => {
    const hasChildren = item.children && item.children.length > 0
    const isOpen = openItems.includes(item.title)
    const active = isActive(item.href)

    if (hasChildren) {
      return (
        <Collapsible
          key={item.href}
          open={isOpen}
          onOpenChange={() => toggleItem(item.title)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.title}
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pt-1 space-y-1">
            {item.children!.map(child => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive(child.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {child.icon}
                {child.title}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        {item.icon}
        {item.title}
      </Link>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <Factory className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-lg font-bold">MTOPREV</h1>
          <p className="text-xs text-muted-foreground">Gestión de Mantenimiento</p>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {sidebarItems.map(renderNavItem)}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings className="h-4 w-4" />
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-background border-r transform transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
        {sidebarContent}
      </aside>
    </>
  )
}
