import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
      <span className="sr-only">Toggle navigation menu</span>
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="flex flex-col">
    <SheetHeader>
      <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
    </SheetHeader>
    <nav className="grid gap-6 text-lg font-medium">
      <Link
        href="#"
      >
      </Link>
    </nav>
  </SheetContent>
</Sheet> 