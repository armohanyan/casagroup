import { Route, Switch, useLocation } from "wouter";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import IndexPage from "./pages/index";
import ProjectsPage from "./pages/projects";
import ProjectDetailPage from "./pages/project-detail";
import ApartmentDetailPage from "./pages/apartment-detail";
import ServicesPage from "./pages/services";
import AboutPage from "./pages/about";
import ContactPage from "./pages/contact";
import AdminPage from "./pages/admin";

function SiteLayout() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin-lx9k2m");

  if (isAdmin) {
    return <AdminPage />;
  }

  return (
    <div className="bg-[#0C1428] min-h-screen font-['DM_Sans']">
      <Navbar />
      <Switch>
        <Route path="/" component={IndexPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/projects/:slug" component={ProjectDetailPage} />
        <Route path="/projects/:slug/apartments/:aptId" component={ApartmentDetailPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route>
          <main className="min-h-screen flex items-center justify-center pt-20">
            <div className="text-center">
              <p className="font-['Cormorant_Garamond'] text-[10rem] text-[#0f1e30] font-light leading-none">404</p>
              <p className="text-[#9a9085] mt-4 mb-8">Page not found</p>
              <a href="/" className="text-xs tracking-[0.3em] uppercase text-[#c9a96e] hover:text-[#e8d5b0]">
                ← Back Home
              </a>
            </div>
          </main>
        </Route>
      </Switch>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Provider>
      <SiteLayout />
      {import.meta.env.DEV && <AgentFeedback />}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
