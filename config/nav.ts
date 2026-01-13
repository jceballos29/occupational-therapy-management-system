import { Calendar, CreditCard, Home, Settings, Users } from "lucide-react"

export const navLinks = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    title: "Pacientes",
    href: "/patients",
    icon: Users,
  },
  {
    title: "Facturación",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Configuración",
    href: "/config/insurers",
    icon: Settings,
  },
]