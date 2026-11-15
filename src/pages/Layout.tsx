import { Outlet } from "react-router-dom";
import { NavbarPartial } from "../partials/navbar-partial";
import { FooterPartial } from "../partials/footer-partial";
import { ThemeProvider } from "../context/ThemeContext";
import { PwaPrompt } from "../components/PwaPrompt";

const Layout = () => {
  return (
    <ThemeProvider>
      <NavbarPartial />
      <main>
        <Outlet />
      </main>
      <PwaPrompt />
      <FooterPartial />
    </ThemeProvider>
  );
};

export default Layout;
