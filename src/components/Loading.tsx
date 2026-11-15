import "../../public/css/loading.css";
import { useThemeContext } from "../context/theme-context";

const Loading = () => {
  const { mode } = useThemeContext();
  return (
    <div className="loading-wrapper" data-theme={mode}>
      <div className="loading-spinner" />
      <p className="loading-text">Loading content...</p>
    </div>
  );
};

export default Loading;
