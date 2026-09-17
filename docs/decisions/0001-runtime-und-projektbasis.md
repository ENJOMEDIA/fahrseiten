# ADR 0001: Laufzeit und Projektbasis

- Status: angenommen
- Datum: 17. September 2026
- Betrifft: Phase 2, OD-03

## Kontext

Der aktuelle Auftrag legt Node.js 22, Next.js App Router, React, TypeScript Strict Mode und Tailwind CSS fest. Das Projekt muss zunächst als Node.js-Anwendung auf Shared Hosting und später auf einem VPS laufen. Die lokale Codex-Laufzeit stellt Node 24 bereit; sie dient nur als zusätzliche Kompatibilitätsprüfung.

## Entscheidung

Das Projekt verwendet Node.js 22 als deklarierte Zielumgebung, pnpm mit versionierter Lockdatei, Next.js 16.3, React 19.2, TypeScript 5.9, Tailwind CSS 4.3, ESLint 9 und Prettier 3. Vitest mit Testing Library bildet die Unit-/Integrationstestgrundlage; Playwright deckt Browserabläufe ab. Zod validiert Laufzeitkonfiguration.

Die Anwendung bleibt ein einzelnes Next.js-Projekt unter `src/app`. Fachmodule werden später unter `src/modules`, Infrastrukturadapter unter `src/infrastructure` und geteilte Bausteine unter `src/components` beziehungsweise `src/lib` organisiert.

## Gründe

Die Next.js-Dokumentation nennt Node.js 20.9 als Minimum und unterstützt den App Router. Node 22 liegt darüber und ist durch den Auftrag gesetzt. Die aktuellen Next.js- und Tailwind-Anleitungen verwenden React, TypeScript, ESLint, App Router und den Tailwind-PostCSS-Adapter. pnpm ermöglicht reproduzierbare Installationen mit einer kompakten Lockdatei.

TypeScript 7 und React 19.3 werden nicht vorzeitig übernommen, weil das offizielle Next.js-Gerüst derzeit TypeScript 5.9 und React 19.2 auswählt. ESLint 9 wird trotz seiner Upstream-Warnung verwendet, weil das aktuelle Next.js-Gerüst diese kompatible Version auswählt; die Aktualisierung auf ESLint 10 wird geprüft, sobald `eslint-config-next` sie offiziell unterstützt.

## Folgen

Ein frischer Checkout benötigt Node.js 22 und pnpm 11. `pnpm check` führt Formatprüfung, Linting, Typprüfung, Unit-Tests und Produktions-Build aus. Browser-Binaries für Playwright werden separat installiert. Der reale netcup-Startmechanismus bleibt bis zur Infrastrukturprüfung unbestätigt.

## Quellen und Nachweise

Geprüft am 17. September 2026: offizielle Next.js-Installations- und Deployment-Dokumentation, offizielle Tailwind-Next.js-Anleitung sowie das von `create-next-app` 16.3.5 erzeugte Abhängigkeitsset. Die Paketauflösung wird durch `pnpm-lock.yaml` fixiert.

## Rücknahme

Versionen können über einen eigenen geprüften Upgrade-Commit geändert werden. Der modulare Aufbau und die Fachlogik dürfen dabei nicht an einen Hostinganbieter gekoppelt werden.
