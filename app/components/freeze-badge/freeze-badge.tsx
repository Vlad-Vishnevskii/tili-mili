import classnames from "classnames";
import styles from "./styles.module.css";

type FreezeBadgeProps = {
  className?: string;
  label?: string;
};

export const FreezeBadge = ({
  className,
  label = "Заморозка",
}: FreezeBadgeProps) => {
  return (
    <span className={classnames(styles.badge, className)}>
      <span className={styles.iconWrap} aria-hidden="true">
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2V22M12 2L9.5 4.5M12 2L14.5 4.5M12 22L9.5 19.5M12 22L14.5 19.5M3.34 7L20.66 17M3.34 7L6.76 7.92M3.34 7L4.26 10.42M20.66 17L17.24 16.08M20.66 17L19.74 13.58M3.34 17L20.66 7M3.34 17L4.26 13.58M3.34 17L6.76 16.08M20.66 7L19.74 10.42M20.66 7L17.24 7.92"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{label}</span>
    </span>
  );
};
