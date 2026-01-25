interface StatusBadgeProps {
  isEnabled: boolean;
  theme: "light" | "dark";
  onClick?: () => void;
}

export function StatusBadge({ isEnabled, theme, onClick }: StatusBadgeProps): React.ReactElement {
  const statusColor = isEnabled ? "#22c55e" : "#ef4444";
  const statusText = isEnabled ? "Enabled" : "Disabled";
  const backgroundColor = theme === "dark" ? "#1a1a1a" : "#ffffff";
  const borderColor = theme === "dark" ? "#333333" : "#e5e5e5";
  const textColor = theme === "dark" ? "#e5e5e5" : "#000000";

  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        position: "absolute",
        top: "44px",
        right: "16px",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        borderRadius: "12px",
        border: `1.5px solid ${borderColor}`,
        backgroundColor,
        fontSize: "12px",
        fontWeight: 500,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: statusColor,
          boxShadow: `0 0 8px ${statusColor}80, 0 0 4px ${statusColor}`,
        }}
      />
      <span style={{ color: textColor }}>{statusText}</span>
    </div>
  );
}
