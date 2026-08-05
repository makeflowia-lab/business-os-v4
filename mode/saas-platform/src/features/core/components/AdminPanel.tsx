"use client";

import React, { useState } from "react";
import {
  CloudIcon,
  ServerIcon,
  MonitorIcon,
  FileTextIcon,
  PackageIcon,
  KeyIcon,
  DownloadIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  CopyIcon,
  TerminalIcon,
  HardDriveIcon,
  GlobeIcon,
  LockIcon,
  BookOpenIcon,
  WrenchIcon,
  ChevronRightIcon,
  MonitorIcon as ScreenIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────

type DeploymentMode = "CLOUD" | "VPS" | "LOCAL";
type Step = "select" | "form" | "docs";

interface CloudFormData {
  tenantName: string;
  adminEmail: string;
  adminPassword: string;
  domain: string;
  databaseUrl: string;
  apiKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  jwtSecret: string;
}

interface VPSFormData {
  tenantName: string;
  serverIp: string;
  serverOs: string;
  sshUser: string;
  sshKeyPath: string;
  adminEmail: string;
  adminPassword: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  appPort: string;
  jwtSecret: string;
}

interface LocalFormData {
  tenantName: string;
  adminEmail: string;
  adminPassword: string;
  licenseKey: string;
  licenseType: string;
  targetOs: string;
  appVersion: string;
  backupPath: string;
}

interface DocSection {
  title: string;
  icon: React.ReactNode;
  content: string;
  type: "info" | "code" | "credentials" | "steps";
}

// ── Document generators ──────────────────────────────────────────────

function generateCloudDocs(data: CloudFormData): DocSection[] {
  return [
    {
      title: "Credenciales de Acceso",
      icon: <KeyIcon className="w-5 h-5" />,
      type: "credentials",
      content: `# Credenciales de Acceso — Cloud
Empresa: ${data.tenantName}

▸ Panel Administrativo
  URL:        https://${data.domain}
  Usuario:    ${data.adminEmail}
  Password:   ${data.adminPassword}

▸ API Endpoint
  Base URL:   https://${data.domain}/api/v1
  API Key:    ${data.apiKey || "(no configurada)"}

▸ Base de Datos
  URL:        ${data.databaseUrl}`,
    },
    {
      title: "Guía de Acceso Rápido",
      icon: <GlobeIcon className="w-5 h-5" />,
      type: "steps",
      content: `# Guía de Acceso — ${data.tenantName} (Cloud)

## Paso 1: Acceda al Panel
Abra su navegador y diríjase a:
https://${data.domain}

## Paso 2: Inicie Sesión
Usuario: ${data.adminEmail}
Password: ${data.adminPassword}
(Cambie su contraseña al primer inicio de sesión)

## Paso 3: Configure su Organización
- Agregue usuarios y asigne roles (SUPERADMIN, ADMIN, USER)
- Configure la facturación
- Personalice el branding de su tenant

## Características Incluidas
✅ Auto-escalamiento automático
✅ CDN global (latencia < 50ms)
✅ Respaldos automáticos diarios
✅ SSL/TLS incluido
✅ Multi-tenant con aislamiento de datos
✅ 99.9% uptime garantizado`,
    },
    {
      title: "Variables de Entorno (.env)",
      icon: <TerminalIcon className="w-5 h-5" />,
      type: "code",
      content: `# .env — ${data.tenantName} (Cloud)

DEPLOYMENT_MODE=CLOUD
DATABASE_URL=${data.databaseUrl}
NEXT_PUBLIC_APP_URL=https://${data.domain}
JWT_SECRET=${data.jwtSecret}

# Stripe
STRIPE_SECRET_KEY=${data.stripeSecretKey || "sk_live_XXXXXXXXX"}
STRIPE_WEBHOOK_SECRET=${data.stripeWebhookSecret || "whsec_XXXXXXXXX"}

# Email / SMTP
SMTP_HOST=${data.smtpHost || "smtp.resend.com"}
SMTP_PORT=${data.smtpPort || "465"}
SMTP_USER=${data.smtpUser || "resend"}
SMTP_PASS=${data.smtpPass || "re_XXXXXXXXX"}`,
    },
    {
      title: "Manual de Usuario",
      icon: <BookOpenIcon className="w-5 h-5" />,
      type: "info",
      content: `# Manual de Usuario — ${data.tenantName} (Cloud)

## Inicio de Sesión
Ingrese con sus credenciales en https://${data.domain}

## Dashboard Principal
- Vista general de métricas en tiempo real
- Gestión de usuarios y permisos
- Configuración de empresa / organización

## Módulos Disponibles
- **Gestión de Usuarios**: Roles SUPERADMIN, ADMIN, USER
- **Facturación**: Planes FREE, BASIC, PRO, ENTERPRISE
- **Soporte Técnico**: Sistema de tickets con prioridades
- **Respaldos**: Automáticos (Cloud)
- **Documentación**: Generación automática PDF, MD, HTML`,
    },
    {
      title: "Guía de Mantenimiento",
      icon: <WrenchIcon className="w-5 h-5" />,
      type: "info",
      content: `# Guía de Mantenimiento — ${data.tenantName}

## Respaldos
- Los respaldos son automáticos (diarios a las 3:00 AM UTC)
- Retención: 30 días

## Actualizaciones
- Las actualizaciones se aplican automáticamente
- Notificaciones por email a: ${data.adminEmail}

## Monitoreo
- Dashboard de salud en https://${data.domain}/admin/health
- Alertas automáticas por email

## Soporte Técnico
- Email: soporte@saasfactory.com
- Horario: Lun-Vie 9:00 - 18:00 CST
- SLA: Respuesta en < 4 horas (plan PRO/ENTERPRISE)`,
    },
  ];
}

function generateVPSDocs(data: VPSFormData): DocSection[] {
  const slug = data.tenantName.toLowerCase().replace(/\s+/g, "-");
  return [
    {
      title: "Credenciales de Servidor",
      icon: <KeyIcon className="w-5 h-5" />,
      type: "credentials",
      content: `# Credenciales — ${data.tenantName} (VPS)

▸ Panel Administrativo
  URL:        http://${data.serverIp}:${data.appPort}
  Usuario:    ${data.adminEmail}
  Password:   ${data.adminPassword}

▸ Acceso SSH
  Host:       ${data.serverIp}
  Puerto:     22
  Usuario:    ${data.sshUser}
  SSH Key:    ${data.sshKeyPath}

▸ Base de Datos PostgreSQL
  Host:       localhost (dentro del contenedor Docker)
  Database:   ${data.dbName}
  User:       ${data.dbUser}
  Password:   ${data.dbPassword}
  Port:       5432`,
    },
    {
      title: "Guía de Instalación VPS",
      icon: <ServerIcon className="w-5 h-5" />,
      type: "steps",
      content: `# Instalación VPS — ${data.tenantName}

## Datos del Servidor
- IP: ${data.serverIp}
- OS: ${data.serverOs}
- Usuario SSH: ${data.sshUser}

## Paso 1: Conectar al servidor
ssh ${data.sshUser}@${data.serverIp} -i ${data.sshKeyPath}

## Paso 2: Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

## Paso 3: Crear directorio de trabajo
mkdir -p /opt/saas-factory
cd /opt/saas-factory

## Paso 4: Copiar archivos de despliegue
Suba el docker-compose.yml y deploy.sh al servidor.

## Paso 5: Levantar servicios
docker compose up -d

## Paso 6: Verificar
docker compose ps
curl http://localhost:${data.appPort}

## Resultado Esperado
La aplicación estará disponible en:
http://${data.serverIp}:${data.appPort}`,
    },
    {
      title: "docker-compose.yml",
      icon: <PackageIcon className="w-5 h-5" />,
      type: "code",
      content: `# docker-compose.yml — ${data.tenantName} (VPS)

version: '3.8'
services:
  app:
    build: .
    ports:
      - "${data.appPort}:3000"
    environment:
      - DATABASE_URL=postgresql://${data.dbUser}:${data.dbPassword}@db:5432/${data.dbName}
      - DEPLOYMENT_MODE=VPS
      - JWT_SECRET=${data.jwtSecret}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=${data.dbUser}
      - POSTGRES_PASSWORD=${data.dbPassword}
      - POSTGRES_DB=${data.dbName}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:`,
    },
    {
      title: "Script de Despliegue (deploy.sh)",
      icon: <TerminalIcon className="w-5 h-5" />,
      type: "code",
      content: `#!/bin/bash
# deploy.sh — ${data.tenantName}
# Servidor: ${data.serverIp} (${data.serverOs})

echo "══════════════════════════════════════"
echo "   SaaS Factory — VPS Deployer"
echo "   Cliente: ${data.tenantName}"
echo "══════════════════════════════════════"

echo "▸ Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

echo "▸ Configurando entorno..."
mkdir -p /opt/saas-factory
cd /opt/saas-factory

echo "▸ Levantando servicios..."
docker compose up -d

echo "▸ Verificando..."
sleep 5
docker compose ps

echo ""
echo "🚀 Despliegue completado para ${data.tenantName}"
echo "📍 URL: http://${data.serverIp}:${data.appPort}"
echo "══════════════════════════════════════"`,
    },
    {
      title: "Manual de Usuario",
      icon: <BookOpenIcon className="w-5 h-5" />,
      type: "info",
      content: `# Manual de Usuario — ${data.tenantName} (VPS)

## Inicio de Sesión
Ingrese con sus credenciales en:
http://${data.serverIp}:${data.appPort}

## Dashboard Principal
- Vista general de métricas
- Gestión de usuarios y permisos
- Configuración de empresa

## Módulos Disponibles
- **Gestión de Usuarios**: Roles SUPERADMIN, ADMIN, USER
- **Facturación**: Planes FREE, BASIC, PRO, ENTERPRISE
- **Soporte Técnico**: Sistema de tickets con prioridades
- **Respaldos**: Manuales y programados
- **Documentación**: Generación automática PDF, MD, HTML`,
    },
    {
      title: "Guía de Mantenimiento",
      icon: <WrenchIcon className="w-5 h-5" />,
      type: "info",
      content: `# Guía de Mantenimiento — ${data.tenantName} (VPS)

## Respaldos
- Configure respaldos periódicos del volumen pgdata
- Comando: docker compose exec db pg_dump -U ${data.dbUser} ${data.dbName} > backup.sql

## Actualizaciones
- Conectar por SSH: ssh ${data.sshUser}@${data.serverIp} -i ${data.sshKeyPath}
- Actualizar: cd /opt/saas-factory && docker compose pull && docker compose up -d

## Monitoreo
- Verificar servicios: docker compose ps
- Ver logs: docker compose logs -f app

## Soporte Técnico
- Email: soporte@saasfactory.com
- Horario: Lun-Vie 9:00 - 18:00 CST`,
    },
  ];
}

function generateLocalDocs(data: LocalFormData): DocSection[] {
  const ext = data.targetOs === "windows" ? "exe" : data.targetOs === "mac" ? "dmg" : "AppImage";
  const appDataPath = data.targetOs === "windows"
    ? "%APPDATA%\\SaaS-Factory"
    : data.targetOs === "mac"
    ? "~/Library/Application Support/SaaS-Factory"
    : "~/.config/saas-factory";

  return [
    {
      title: "Credenciales y Licencia",
      icon: <KeyIcon className="w-5 h-5" />,
      type: "credentials",
      content: `# Credenciales — ${data.tenantName} (Local)

▸ Aplicación Local
  URL:        http://localhost:3000
  Usuario:    ${data.adminEmail}
  Password:   ${data.adminPassword}

▸ Clave de Activación
  Licencia:   ${data.licenseKey}
  Tipo:       ${data.licenseType}
  Machine ID: (Se genera automáticamente al instalar)

▸ Base de Datos Local
  Archivo:    ${appDataPath}\\data.db
  Respaldos:  ${data.backupPath || `${appDataPath}\\backups\\`}`,
    },
    {
      title: "Guía de Instalación",
      icon: <ScreenIcon className="w-5 h-5" />,
      type: "steps",
      content: `# Guía de Instalación — ${data.tenantName}
Plataforma: ${data.targetOs.charAt(0).toUpperCase() + data.targetOs.slice(1)}
Versión: ${data.appVersion}

## Requisitos Mínimos
- ${data.targetOs === "windows" ? "Windows 10/11" : data.targetOs === "mac" ? "macOS 12+" : "Ubuntu 20.04+"}
- 2GB RAM, 500MB disco libre
- No requiere internet después de la activación

## Paso 1: Ejecutar Instalador
Archivo: SaaS-Factory-Local-v${data.appVersion}-${data.targetOs}.${ext}
${data.targetOs === "windows" ? "Haga doble clic y siga el asistente de instalación." : data.targetOs === "mac" ? "Abra el .dmg y arrastre a la carpeta Aplicaciones." : "Otorgue permisos de ejecución: chmod +x *.AppImage"}

## Paso 2: Activar Licencia
Ingrese su clave de activación: ${data.licenseKey}
El sistema validará la clave y la vinculará al hardware de este equipo.

## Paso 3: Configuración Inicial
- Usuario admin: ${data.adminEmail}
- Password: ${data.adminPassword}
- La base de datos local se creará automáticamente

## Paso 4: Listo
Acceda vía http://localhost:3000`,
    },
    {
      title: "Sistema de Licencias",
      icon: <LockIcon className="w-5 h-5" />,
      type: "info",
      content: `# Sistema de Licencias — ${data.tenantName}

## Datos de la Licencia
- Clave: ${data.licenseKey}
- Tipo: ${data.licenseType}
- Versión: ${data.appVersion}

## Tipos de Licencia
- **Trial**: 30 días, funcionalidad completa
- **Anual**: 1 año, renovación automática
- **Perpetua**: Sin expiración, incluye 1 año de actualizaciones

## Activación por Hardware
La licencia se vincula al Machine ID del equipo.
Para transferir a otro equipo, contacte soporte con su clave.

## Verificación Offline
La licencia se valida localmente sin conexión a internet
después de la primera activación.`,
    },
    {
      title: "Respaldos Manuales",
      icon: <HardDriveIcon className="w-5 h-5" />,
      type: "info",
      content: `# Respaldos — ${data.tenantName} (Local)

## Ubicación de Datos
Ruta: ${appDataPath}\\data.db
Respaldos: ${data.backupPath || `${appDataPath}\\backups\\`}

## Crear Respaldo Manual
1. Abra la aplicación → Configuración → Respaldos
2. Haga clic en "Crear Respaldo"
3. El archivo se guardará en la carpeta de respaldos

## Restaurar Respaldo
1. Configuración → Respaldos → Restaurar
2. Seleccione el archivo .backup
3. Confirme la restauración

## Programar Respaldos Automáticos
- Diario, Semanal, o Mensual
- Retención configurable: 5, 10, o 30 respaldos`,
    },
    {
      title: "Manual de Usuario",
      icon: <BookOpenIcon className="w-5 h-5" />,
      type: "info",
      content: `# Manual de Usuario — ${data.tenantName} (Local)

## Inicio de Sesión
Abra la aplicación e ingrese:
- Usuario: ${data.adminEmail}
- Password: ${data.adminPassword}

## Dashboard Principal
- Vista general de métricas locales
- Gestión de usuarios
- Configuración de empresa

## Módulos Disponibles
- **Gestión de Usuarios**: Roles ADMIN, USER
- **Respaldos**: Manuales y programados
- **Documentación**: Generación local PDF, MD, HTML

## Funcionamiento Offline
La aplicación funciona 100% sin conexión a internet.
Los datos se almacenan localmente en: ${appDataPath}`,
    },
  ];
}

// ── Form field component ─────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  half = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  half?: boolean;
}) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
        required={required}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="col-span-2 text-sm font-bold text-slate-300 border-b border-slate-700/50 pb-2 mt-4 flex items-center gap-2">
      {children}
    </h3>
  );
}

// ── Clipboard ────────────────────────────────────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ── Main Component ──────────────────────────────────────────────────

export default function AdminPanel() {
  const [step, setStep] = useState<Step>("select");
  const [selectedMode, setSelectedMode] = useState<DeploymentMode | null>(null);
  const [expandedSection, setExpandedSection] = useState(0);
  const [copied, setCopied] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<DocSection[]>([]);
  const [docMeta, setDocMeta] = useState({ title: "", subtitle: "", color: "", gradient: "" });

  // Form states
  const [cloudForm, setCloudForm] = useState<CloudFormData>({
    tenantName: "", adminEmail: "", adminPassword: "", domain: "",
    databaseUrl: "", apiKey: "", stripeSecretKey: "", stripeWebhookSecret: "",
    smtpHost: "", smtpPort: "465", smtpUser: "", smtpPass: "", jwtSecret: "",
  });

  const [vpsForm, setVpsForm] = useState<VPSFormData>({
    tenantName: "", serverIp: "", serverOs: "Ubuntu 22.04 LTS",
    sshUser: "root", sshKeyPath: "~/.ssh/id_rsa",
    adminEmail: "", adminPassword: "",
    dbUser: "saas_user", dbPassword: "", dbName: "saasdb",
    appPort: "3000", jwtSecret: "",
  });

  const [localForm, setLocalForm] = useState<LocalFormData>({
    tenantName: "", adminEmail: "", adminPassword: "",
    licenseKey: "", licenseType: "Anual", targetOs: "windows",
    appVersion: "1.0.0", backupPath: "",
  });

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    if (selectedMode === "CLOUD") {
      setGeneratedDocs(generateCloudDocs(cloudForm));
      setDocMeta({ title: `SaaS Cloud — ${cloudForm.tenantName}`, subtitle: "Infraestructura multi-tenant en la nube", color: "blue", gradient: "from-blue-500 to-cyan-400" });
    } else if (selectedMode === "VPS") {
      setGeneratedDocs(generateVPSDocs(vpsForm));
      setDocMeta({ title: `SaaS VPS — ${vpsForm.tenantName}`, subtitle: `Servidor ${vpsForm.serverIp} (${vpsForm.serverOs})`, color: "orange", gradient: "from-orange-500 to-amber-400" });
    } else {
      setGeneratedDocs(generateLocalDocs(localForm));
      setDocMeta({ title: `SaaS Local — ${localForm.tenantName}`, subtitle: `${localForm.targetOs} v${localForm.appVersion}`, color: "emerald", gradient: "from-emerald-500 to-teal-400" });
    }
    setExpandedSection(0);
    setStep("docs");
  };

  const cards = [
    {
      mode: "CLOUD" as DeploymentMode,
      title: "SaaS Cloud",
      icon: <CloudIcon className="w-8 h-8" />,
      description: "Infraestructura gestionada en la nube. Multi-tenant habilitado.",
      features: ["Multi-tenant", "Auto-scaling", "SSL incluido", "CDN global"],
      gradient: "from-blue-600 to-cyan-500",
      glow: "shadow-blue-500/20",
      color: "blue",
    },
    {
      mode: "VPS" as DeploymentMode,
      title: "SaaS VPS",
      icon: <ServerIcon className="w-8 h-8" />,
      description: "Docker en servidor propio del cliente. Control total.",
      features: ["Docker Compose", "SSH Deploy", "DB dedicada", "Scripts auto"],
      gradient: "from-orange-600 to-amber-500",
      glow: "shadow-orange-500/20",
      color: "orange",
    },
    {
      mode: "LOCAL" as DeploymentMode,
      title: "SaaS Local",
      icon: <MonitorIcon className="w-8 h-8" />,
      description: "Instalación en PC. Funciona sin internet. Licencia offline.",
      features: ["Instalador nativo", "Licencia offline", "DB embebida", "Respaldos"],
      gradient: "from-emerald-600 to-teal-500",
      glow: "shadow-emerald-500/20",
      color: "emerald",
    },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // STEP 1: Select Mode
  // ═══════════════════════════════════════════════════════════════════

  if (step === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
        <header className="px-8 pt-10 pb-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
              SaaS Factory
            </h1>
            <p className="text-slate-400 mt-3 text-lg">
              Seleccione el modo de despliegue para generar la documentación del cliente
            </p>
          </div>
        </header>

        <main className="px-8 pb-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {cards.map((card) => (
              <button
                key={card.mode}
                onClick={() => { setSelectedMode(card.mode); setStep("form"); }}
                className="group text-left p-8 rounded-3xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-xl
                           hover:border-slate-500/60 hover:bg-slate-800/80
                           transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1
                           active:scale-[0.98] cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 text-white shadow-lg ${card.glow} group-hover:shadow-xl transition-shadow`}>
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">{card.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {card.features.map((f) => (
                    <span key={f} className="text-xs bg-slate-700/60 text-slate-300 px-3 py-1 rounded-full border border-slate-600/40">{f}</span>
                  ))}
                </div>
                <div className={`flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                  Configurar y Generar <ChevronRightIcon className={`w-4 h-4 text-${card.color}-400`} />
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2: Form
  // ═══════════════════════════════════════════════════════════════════

  if (step === "form") {
    const card = cards.find((c) => c.mode === selectedMode)!;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
        <header className="px-8 pt-8 pb-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setStep("select")}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg`}>
                {card.icon}
              </div>
              <div>
                <h1 className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${card.gradient}`}>
                  {card.title}
                </h1>
                <p className="text-slate-400 text-sm mt-1">Ingrese los datos reales del cliente para generar la documentación</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-8 pb-16 pt-4">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}
              className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* ── Cloud form ─── */}
                {selectedMode === "CLOUD" && (
                  <>
                    <SectionTitle>🏢 Información del Cliente</SectionTitle>
                    <Field label="Nombre de la Empresa / Tenant" value={cloudForm.tenantName} onChange={(v) => setCloudForm({ ...cloudForm, tenantName: v })} placeholder="Ej: Mi Empresa S.A." required half={false} />
                    <Field label="Dominio / URL" value={cloudForm.domain} onChange={(v) => setCloudForm({ ...cloudForm, domain: v })} placeholder="Ej: app.miempresa.com" required half />
                    <Field label="API Key" value={cloudForm.apiKey} onChange={(v) => setCloudForm({ ...cloudForm, apiKey: v })} placeholder="Ej: sk_live_xxxxxxxxxxxx" half />

                    <SectionTitle>🔐 Credenciales Admin</SectionTitle>
                    <Field label="Email Administrador" value={cloudForm.adminEmail} onChange={(v) => setCloudForm({ ...cloudForm, adminEmail: v })} placeholder="admin@empresa.com" required half type="email" />
                    <Field label="Password Inicial" value={cloudForm.adminPassword} onChange={(v) => setCloudForm({ ...cloudForm, adminPassword: v })} placeholder="Contraseña temporal" required half />
                    <Field label="JWT Secret" value={cloudForm.jwtSecret} onChange={(v) => setCloudForm({ ...cloudForm, jwtSecret: v })} placeholder="Clave secreta para JWT" half />

                    <SectionTitle>🗄️ Base de Datos</SectionTitle>
                    <Field label="Database URL (PostgreSQL)" value={cloudForm.databaseUrl} onChange={(v) => setCloudForm({ ...cloudForm, databaseUrl: v })} placeholder="postgresql://user:pass@host/db?sslmode=require" required />

                    <SectionTitle>💳 Stripe (Opcional)</SectionTitle>
                    <Field label="Stripe Secret Key" value={cloudForm.stripeSecretKey} onChange={(v) => setCloudForm({ ...cloudForm, stripeSecretKey: v })} placeholder="sk_live_xxxxxxxxx" half />
                    <Field label="Stripe Webhook Secret" value={cloudForm.stripeWebhookSecret} onChange={(v) => setCloudForm({ ...cloudForm, stripeWebhookSecret: v })} placeholder="whsec_xxxxxxxxx" half />

                    <SectionTitle>📧 SMTP / Email (Opcional)</SectionTitle>
                    <Field label="SMTP Host" value={cloudForm.smtpHost} onChange={(v) => setCloudForm({ ...cloudForm, smtpHost: v })} placeholder="smtp.resend.com" half />
                    <Field label="SMTP Port" value={cloudForm.smtpPort} onChange={(v) => setCloudForm({ ...cloudForm, smtpPort: v })} placeholder="465" half />
                    <Field label="SMTP User" value={cloudForm.smtpUser} onChange={(v) => setCloudForm({ ...cloudForm, smtpUser: v })} placeholder="resend" half />
                    <Field label="SMTP Password" value={cloudForm.smtpPass} onChange={(v) => setCloudForm({ ...cloudForm, smtpPass: v })} placeholder="re_xxxxxxxxx" half />
                  </>
                )}

                {/* ── VPS form ─── */}
                {selectedMode === "VPS" && (
                  <>
                    <SectionTitle>🏢 Información del Cliente</SectionTitle>
                    <Field label="Nombre de la Empresa / Tenant" value={vpsForm.tenantName} onChange={(v) => setVpsForm({ ...vpsForm, tenantName: v })} placeholder="Ej: Mi Empresa S.A." required />

                    <SectionTitle>🖥️ Datos del Servidor</SectionTitle>
                    <Field label="IP del Servidor" value={vpsForm.serverIp} onChange={(v) => setVpsForm({ ...vpsForm, serverIp: v })} placeholder="Ej: 192.168.1.100" required half />
                    <Field label="Sistema Operativo" value={vpsForm.serverOs} onChange={(v) => setVpsForm({ ...vpsForm, serverOs: v })} placeholder="Ubuntu 22.04 LTS" half />
                    <Field label="Usuario SSH" value={vpsForm.sshUser} onChange={(v) => setVpsForm({ ...vpsForm, sshUser: v })} placeholder="root" half />
                    <Field label="Ruta SSH Key" value={vpsForm.sshKeyPath} onChange={(v) => setVpsForm({ ...vpsForm, sshKeyPath: v })} placeholder="~/.ssh/id_rsa" half />
                    <Field label="Puerto de la App" value={vpsForm.appPort} onChange={(v) => setVpsForm({ ...vpsForm, appPort: v })} placeholder="3000" half />

                    <SectionTitle>🔐 Credenciales Admin</SectionTitle>
                    <Field label="Email Administrador" value={vpsForm.adminEmail} onChange={(v) => setVpsForm({ ...vpsForm, adminEmail: v })} placeholder="admin@empresa.com" required half type="email" />
                    <Field label="Password Inicial" value={vpsForm.adminPassword} onChange={(v) => setVpsForm({ ...vpsForm, adminPassword: v })} placeholder="Contraseña temporal" required half />
                    <Field label="JWT Secret" value={vpsForm.jwtSecret} onChange={(v) => setVpsForm({ ...vpsForm, jwtSecret: v })} placeholder="Clave secreta para JWT" half />

                    <SectionTitle>🗄️ Base de Datos PostgreSQL</SectionTitle>
                    <Field label="DB User" value={vpsForm.dbUser} onChange={(v) => setVpsForm({ ...vpsForm, dbUser: v })} placeholder="saas_user" required half />
                    <Field label="DB Password" value={vpsForm.dbPassword} onChange={(v) => setVpsForm({ ...vpsForm, dbPassword: v })} placeholder="Contraseña de BD" required half />
                    <Field label="DB Name" value={vpsForm.dbName} onChange={(v) => setVpsForm({ ...vpsForm, dbName: v })} placeholder="saasdb" required half />
                  </>
                )}

                {/* ── Local form ─── */}
                {selectedMode === "LOCAL" && (
                  <>
                    <SectionTitle>🏢 Información del Cliente</SectionTitle>
                    <Field label="Nombre de la Empresa / Cliente" value={localForm.tenantName} onChange={(v) => setLocalForm({ ...localForm, tenantName: v })} placeholder="Ej: Mi Empresa S.A." required />

                    <SectionTitle>🔐 Credenciales Admin</SectionTitle>
                    <Field label="Email Administrador" value={localForm.adminEmail} onChange={(v) => setLocalForm({ ...localForm, adminEmail: v })} placeholder="admin@local" required half type="email" />
                    <Field label="Password Inicial" value={localForm.adminPassword} onChange={(v) => setLocalForm({ ...localForm, adminPassword: v })} placeholder="Contraseña temporal" required half />

                    <SectionTitle>🔑 Licencia</SectionTitle>
                    <Field label="Clave de Licencia" value={localForm.licenseKey} onChange={(v) => setLocalForm({ ...localForm, licenseKey: v })} placeholder="SAAS-XXXX-XXXX-XXXX-XXXX" required half />
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Tipo de Licencia <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={localForm.licenseType}
                        onChange={(e) => setLocalForm({ ...localForm, licenseType: e.target.value })}
                        className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100
                                   focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                      >
                        <option value="Trial (30 días)">Trial (30 días)</option>
                        <option value="Anual">Anual</option>
                        <option value="Perpetua">Perpetua</option>
                      </select>
                    </div>

                    <SectionTitle>💻 Plataforma</SectionTitle>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Sistema Operativo <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={localForm.targetOs}
                        onChange={(e) => setLocalForm({ ...localForm, targetOs: e.target.value })}
                        className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100
                                   focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                      >
                        <option value="windows">Windows</option>
                        <option value="mac">macOS</option>
                        <option value="linux">Linux</option>
                      </select>
                    </div>
                    <Field label="Versión de la App" value={localForm.appVersion} onChange={(v) => setLocalForm({ ...localForm, appVersion: v })} placeholder="1.0.0" half />
                    <Field label="Ruta de Respaldos (opcional)" value={localForm.backupPath} onChange={(v) => setLocalForm({ ...localForm, backupPath: v })} placeholder="Dejar vacío para usar ruta por defecto" />
                  </>
                )}
              </div>

              {/* Submit */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg`}
                >
                  <FileTextIcon className="w-4 h-4" />
                  Generar Documentación
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3: Generated Docs
  // ═══════════════════════════════════════════════════════════════════

  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    blue:    { border: "border-blue-500/30",    bg: "bg-blue-500/10",    text: "text-blue-400" },
    orange:  { border: "border-orange-500/30",  bg: "bg-orange-500/10",  text: "text-orange-400" },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  };
  const c = colorMap[docMeta.color] || colorMap.blue;

  const renderContent = (section: DocSection) => {
    const lines = section.content.trim().split("\n");

    if (section.type === "code") {
      return (
        <div className="relative">
          <button onClick={() => handleCopy(section.content)} className="absolute top-4 right-4 bg-slate-600 hover:bg-slate-500 p-2 rounded-lg transition-colors z-10" title="Copiar">
            {copied ? <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
          </button>
          <pre className="bg-slate-950 border border-slate-700/60 rounded-2xl p-6 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
            {section.content.trim()}
          </pre>
        </div>
      );
    }

    if (section.type === "credentials") {
      return (
        <div className="relative">
          <button onClick={() => handleCopy(section.content)} className="absolute top-4 right-4 bg-slate-600 hover:bg-slate-500 p-2 rounded-lg transition-colors z-10" title="Copiar">
            {copied ? <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
          </button>
          <div className="bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-700/30 rounded-2xl p-6">
            <pre className="text-sm font-mono text-amber-200/90 leading-relaxed whitespace-pre-wrap">{section.content.trim()}</pre>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {lines.map((line, i) => {
          const t = line.trim();
          if (!t) return <div key={i} className="h-2" />;
          if (t.startsWith("# ")) return <h2 key={i} className="text-2xl font-bold text-white mt-4 mb-2">{t.slice(2)}</h2>;
          if (t.startsWith("## ")) return <h3 key={i} className="text-lg font-bold text-slate-200 mt-4 mb-1">{t.slice(3)}</h3>;
          if (t.startsWith("- **")) {
            const m = t.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
            if (m) return <div key={i} className="flex gap-2 text-sm pl-2"><span className="text-slate-500">•</span><span><span className="font-semibold text-slate-200">{m[1]}</span>{m[2] ? `: ${m[2]}` : ""}</span></div>;
          }
          if (t.startsWith("- ")) return <div key={i} className="flex gap-2 text-sm text-slate-300 pl-2"><span className="text-slate-500">•</span><span>{t.slice(2)}</span></div>;
          if (t.startsWith("✅")) return <div key={i} className="flex gap-2 text-sm text-emerald-400 pl-2">{t}</div>;
          if (t.match(/^\d+\./)) return <div key={i} className="flex gap-3 text-sm text-slate-300 pl-2"><span className="text-blue-400 font-bold min-w-[20px]">{t.split(".")[0]}.</span><span>{t.slice(t.indexOf(".") + 2)}</span></div>;
          return <p key={i} className="text-sm text-slate-400 leading-relaxed">{t}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      <header className="px-8 pt-8 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 mb-6">
            <button onClick={() => setStep("select")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Inicio
            </button>
            <span className="text-slate-600">/</span>
            <button onClick={() => setStep("form")} className="text-sm text-slate-400 hover:text-white transition-colors">
              Editar Datos
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${docMeta.gradient} flex items-center justify-center text-white shadow-lg`}>
              {selectedMode === "CLOUD" && <CloudIcon className="w-7 h-7" />}
              {selectedMode === "VPS" && <ServerIcon className="w-7 h-7" />}
              {selectedMode === "LOCAL" && <MonitorIcon className="w-7 h-7" />}
            </div>
            <div>
              <h1 className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${docMeta.gradient}`}>{docMeta.title}</h1>
              <p className="text-slate-400 text-sm mt-1">{docMeta.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 pb-16 pt-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <nav className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 px-3">Documentación Generada</p>
            {generatedDocs.map((section, i) => (
              <button key={i} onClick={() => setExpandedSection(i)}
                className={`p-3 text-left rounded-xl flex items-center gap-3 text-sm transition-all ${expandedSection === i ? `${c.bg} ${c.border} border ${c.text} font-bold` : "hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent"}`}>
                {section.icon}<span className="truncate">{section.title}</span>
              </button>
            ))}
            <div className="mt-6 px-2">
              <button
                onClick={() => {
                  const all = generatedDocs.map(s => `${"=".repeat(60)}\n${s.title}\n${"=".repeat(60)}\n\n${s.content}\n\n`).join("\n");
                  const blob = new Blob([all], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url;
                  a.download = `documentacion-${selectedMode?.toLowerCase()}-${Date.now()}.txt`;
                  a.click(); URL.revokeObjectURL(url);
                }}
                className={`w-full py-3 rounded-xl bg-gradient-to-r ${docMeta.gradient} text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg`}>
                <DownloadIcon className="w-4 h-4" /> Descargar Todo
              </button>
            </div>
          </nav>

          <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 min-h-[600px]">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${c.bg}`}>{generatedDocs[expandedSection]?.icon}</div>
              <h2 className="text-xl font-bold">{generatedDocs[expandedSection]?.title}</h2>
              <span className={`ml-auto text-xs px-3 py-1 rounded-full ${c.bg} ${c.text} border ${c.border} font-bold uppercase`}>{selectedMode}</span>
            </div>
            <div className="border-t border-slate-700/50 pt-6">
              {generatedDocs[expandedSection] && renderContent(generatedDocs[expandedSection])}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
