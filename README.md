# Open-Source SaaS Alternatives

An independent catalog of open-source, self-hosted alternatives to popular paid SaaS products.

Build it yourself, self-host it, keep control of your data, and avoid unnecessary subscriptions. Every alternative in this collection is maintained in its own repository. This repository is only the directory that connects the projects; it is not a monorepo and does not contain their source code.

## Quick Links

- [All Alternatives](#all-alternatives)
- [Featured Projects](#featured-projects)
- [Categories](#categories)
- [Project Status](#project-status)
- [Contributing](CONTRIBUTING.md)
- [Roadmap](#roadmap)
- [License](#license)

## All Alternatives

| Paid Service | Open-Source Alternative | Category | Maturity | Status | Repository |
| --- | --- | --- | --- | --- | --- |
| UptimeRobot | Uptime Monitor | Monitoring | MVP / production usable | 🟢 Ready | [Repository](https://github.com/TunarJamalov/uptime-monitor) |
| Typefully | Post Scheduler | Social Media | Early development | 🟡 Development | [Repository](https://github.com/TunarJamalov/post-scheduler) |
| Obsidian Sync | Git-based vault sync | Storage / Productivity | Planned | 🔵 Planned | Not created yet |
| Bitwarden | Self-hosted password manager alternative | Security | Planned | 🔵 Planned | Not created yet |

Only projects with a real repository link should receive a clickable repository link here. Planned entries are ideas, not promises of an existing implementation.

## Featured Projects

### Uptime Monitor

**Alternative to:** UptimeRobot  
**Category:** Monitoring  
**Status:** 🟢 Ready  
**Maturity:** MVP / production usable

A small, single-process, self-hosted uptime monitoring service with SQLite persistence and a public status page.

**Features:**

- HTTP/HTTPS, SSL, TCP, UDP, DNS, Ping, and WebSocket monitoring
- Heartbeat / Cron monitoring with private generated endpoints
- Domain registration expiration monitoring through real WHOIS lookups
- Incident tracking, uptime history, latency history, and SSL expiry warnings
- Discord, Slack, Telegram, generic JSON webhook, and optional SMTP notifications
- Per-monitor notification policy (failure threshold, repeat and recovery alerts) with notification history
- Maintenance mode, pause/resume, and monitor groups
- Admin dashboard with password sign-in and optional TOTP two-factor authentication
- Public status page, JSON and CSV export, daily SQLite backups, systemd deployment
- Limitation: checks run from a single location only

**Repository:** [github.com/TunarJamalov/uptime-monitor](https://github.com/TunarJamalov/uptime-monitor)

**Installation:** See the Uptime Monitor project's own README. The catalog intentionally does not duplicate its installation instructions.

### Post Scheduler

**Alternative to:** Typefully  
**Category:** Social Media  
**Status:** 🟡 Development  
**Maturity:** Early development

A single-process, self-hosted tool for drafting, splitting into threads, scheduling, and publishing posts to Mastodon and Bluesky, with SQLite storage and the same admin sign-in approach as the Uptime Monitor.

**Features:**

- Posts and threads with per-network character counters
- Scheduling, posting queue with daily slots, drafts, publish now, cancel, automatic retries with history
- Cross-posting to several accounts at once
- Up to four images per thread part with alt text
- Mastodon and Bluesky publishing; encrypted account tokens
- Admin sign-in with optional TOTP, systemd and Docker deployment
- Limitation: no X/Twitter, LinkedIn, or Threads support; no video uploads

**Repository:** [github.com/TunarJamalov/post-scheduler](https://github.com/TunarJamalov/post-scheduler)

**Installation:** See the Post Scheduler project's own README.

## Categories

### Monitoring

- [Uptime Monitor](https://github.com/TunarJamalov/uptime-monitor), an UptimeRobot alternative. Ready.

### Productivity

- Git-based vault sync, an Obsidian Sync alternative. Planned.

### Social Media

- [Post Scheduler](https://github.com/TunarJamalov/post-scheduler), a Typefully alternative. In development.

### Security

- Self-hosted password manager alternative. Planned.

These categories contain only projects that currently exist or have a clearly documented planned entry. New categories should be added when a real project is ready to list.

## Project Status

- 🟢 **Ready**: Usable project with documented setup and maintained source code.
- 🟡 **Development**: Active implementation; not yet considered stable.
- 🟠 **Experimental**: Works for testing or personal use but has important limitations.
- 🔴 **Archived**: No longer actively maintained.
- 🔵 **Planned**: Idea or planned project; a repository may not exist yet.

Status describes maturity honestly. It does not imply that every feature of the original SaaS exists in the alternative.

## Original SaaS Context

The original products in this catalog solve real problems and are often polished hosted services. People may still prefer them for managed infrastructure, support, integrations, reliability, or convenience. A self-hosted alternative is useful when you want data ownership, customization, local control, predictable infrastructure costs, or a way to avoid another subscription.

Pricing and hosted-service features change frequently. This catalog avoids hardcoding prices unless a specific entry is deliberately maintained and verified. Check each original service for current pricing and terms.

## Feature Comparison: Uptime Monitor

| Feature | Hosted UptimeRobot | Uptime Monitor |
| --- | --- | --- |
| Self-hosting | No | Yes |
| Open source | Not the purpose of the hosted product | Yes |
| Subscription | Hosted plans may apply | No hosted subscription |
| Data location | Provider infrastructure | Your SQLite database |
| Public status page | Plan-dependent | Yes |
| Customization | Service-defined | Source-level customization |
| Global monitoring regions | Provider-dependent | Single self-hosted location |

This is a high-level comparison, not a claim of feature parity. The open-source alternative has different operational responsibilities and limitations.

## Adding A Project

Each project must remain in its own repository. Add a concise entry to the table and a short detail section only after verifying that:

- The source code is available under a clear license.
- The project solves a real problem.
- The README explains installation and limitations.
- Self-hosting claims are accurate.
- Repository and status links are real and current.

Use the template in [`docs/project-entry.md`](docs/project-entry.md). Link directly to the project's README instead of copying its setup instructions here.

## Quality Rules

This collection prioritizes quality over quantity. Do not add an AI-generated clone simply because it exists. Avoid fake features, fake repository links, unsupported pricing claims, and misleading comparisons. Be explicit when an entry is experimental or planned.

## Roadmap

- [x] Create the first self-hosted alternative
- [x] Create the central directory
- [x] Define consistent project statuses
- [x] Add contribution and project-entry guidance
- [x] Publish the Uptime Monitor as an independent GitHub repository
- [x] Publish the Post Scheduler repository
- [ ] Add more mature SaaS alternatives
- [ ] Add more categories when projects are ready
- [ ] Add comparison pages for the most important projects
- [ ] Improve discovery with filters or a generated project index

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for suggestions, corrections, project additions, and documentation changes.

## License

This catalog is licensed under the MIT License. Individual projects are independent repositories and may use different licenses. Always check the license in the repository of the project you intend to use.
