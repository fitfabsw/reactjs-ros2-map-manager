import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        Home
      </Link>
      <Link
        to="/map-editor"
        className={location.pathname.startsWith("/map-editor") ? "active" : ""}
      >
        Map Editor
      </Link>
      <Link
        to="/stations"
        className={location.pathname.startsWith("/stations") ? "active" : ""}
      >
        Stations
      </Link>
      <Link
        to="/masks"
        className={location.pathname.startsWith("/masks") ? "active" : ""}
      >
        Masks
      </Link>
    </nav>
  );
}

export default Navigation;
