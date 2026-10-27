import Icon, { type IconName } from "./Icon";
export default function EmptyState({ title, description, href, action, icon = "search" }: { title: string; description: string; href?: string; action?: string; icon?: IconName }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} /></span><h2>{title}</h2><p>{description}</p>{href && action && <a className="btn" href={href}>{action}<Icon name="arrow" /></a>}</div>;
}
