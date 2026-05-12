import type { ReactNode } from "react";
import { Router, Route, Switch, useLocation } from "wouter";
import { Provider } from "@/components/provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalJsonLd } from "@/components/seo/GlobalJsonLd";
import HomePage from "@/components/pages/home-page";
import ProjectsPage from "@/components/pages/projects-page";
import ProjectDetailPage from "@/components/pages/project-detail-page";
import ApartmentDetailPage from "@/components/pages/apartment-detail-page";
import ServicesPage from "@/components/pages/services-page";
import AboutPage from "@/components/pages/about-page";
import ContactPage from "@/components/pages/contact-page";
import AdminPage from "@/components/pages/admin-page";
import NotFoundPage from "@/components/pages/not-found-page";

const ADMIN_PREFIX = "/admin-lx9k2m";

function Shell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const isAdmin = loc === ADMIN_PREFIX || loc.startsWith(`${ADMIN_PREFIX}/`);
  if (isAdmin) return <>{children}</>;
  return (
    <>
      <GlobalJsonLd />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Provider>
      <Router>
        <Shell>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/projects/:slug/apartments/:aptId" component={ApartmentDetailPage} />
            <Route path="/projects/:slug" component={ProjectDetailPage} />
            <Route path="/projects" component={ProjectsPage} />
            <Route path="/services" component={ServicesPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path={ADMIN_PREFIX} component={AdminPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </Shell>
      </Router>
    </Provider>
  );
}
