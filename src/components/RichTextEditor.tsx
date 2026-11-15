import { useEffect, useEffectEvent, useRef } from "react";
import { Box, useTheme } from "@mui/material";
import Quill from "quill";
import "quill/dist/quill.snow.css";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
};

const toolbar = [
  [{ header: [1, 2, 3, 4, false] }],
  ["bold", "italic"],
  ["link", { list: "bullet" }, { list: "ordered" }],
  ["image"],
  ["clean"],
];

// Quill represents an empty document as "<p><br></p>"; treat it as "" so required-field checks keep working.
const isEmpty = (quill: Quill) => quill.getText().trim() === "" && !quill.root.querySelector("img");

export const RichTextEditor = ({ value, onChange, disabled = false, ariaLabel, placeholder }: RichTextEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  // Last HTML emitted by the editor, so we only re-load content when `value` changes from outside (e.g. after fetch).
  const lastValueRef = useRef<string | null>(null);
  const theme = useTheme();
  const emitChange = useEffectEvent((html: string) => onChange(html));

  useEffect(() => {
    const container = containerRef.current!;
    const editorEl = container.appendChild(document.createElement("div"));
    const quill = new Quill(editorEl, {
      theme: "snow",
      modules: { toolbar },
    });
    quillRef.current = quill;

    quill.on("text-change", () => {
      // getSemanticHTML() in Quill 2.0.3 turns every space into &nbsp;, which breaks word wrapping on the public pages.
      const html = isEmpty(quill) ? "" : quill.getSemanticHTML().replaceAll("&nbsp;", " ");
      lastValueRef.current = html;
      emitChange(html);
    });

    return () => {
      quillRef.current = null;
      lastValueRef.current = null;
      container.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const root = quillRef.current?.root;
    root?.setAttribute("data-placeholder", placeholder ?? "");
  }, [placeholder]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || value === lastValueRef.current) return;
    lastValueRef.current = value;
    quill.setContents(quill.clipboard.convert({ html: value }), "silent");
  }, [value]);

  useEffect(() => {
    quillRef.current?.enable(!disabled);
  }, [disabled]);

  useEffect(() => {
    const root = quillRef.current?.root;
    if (!root) return;
    if (ariaLabel) root.setAttribute("aria-label", ariaLabel);
    else root.removeAttribute("aria-label");
  }, [ariaLabel]);

  const borderColor = theme.palette.divider;
  const iconColor = theme.palette.text.secondary;
  const activeColor = theme.palette.primary.main;

  return (
    <Box
      ref={containerRef}
      className="rich-text-editor"
      sx={{
        color: "text.primary",
        "& .ql-toolbar.ql-snow": { bgcolor: "background.paper", borderColor },
        "& .ql-container.ql-snow": { borderColor },
        "& .ql-editor.ql-blank::before": { color: "text.disabled" },
        "& .ql-snow .ql-stroke": { stroke: iconColor },
        "& .ql-snow .ql-fill": { fill: iconColor },
        "& .ql-snow .ql-picker": { color: iconColor },
        "& .ql-snow .ql-picker-options": { bgcolor: "background.paper" },
        "& .ql-snow button:hover .ql-stroke, & .ql-snow button.ql-active .ql-stroke, & .ql-snow .ql-picker-label:hover .ql-stroke": { stroke: activeColor },
        "& .ql-snow button:hover .ql-fill, & .ql-snow button.ql-active .ql-fill": { fill: activeColor },
        "& .ql-snow .ql-picker-label:hover, & .ql-snow .ql-picker-item:hover, & .ql-snow .ql-picker-item.ql-selected": { color: activeColor },
        "& .ql-snow .ql-tooltip": { bgcolor: "background.paper", color: "text.primary", borderColor, zIndex: 101 },
      }}
    />
  );
};
