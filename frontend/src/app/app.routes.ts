
import { Routes } from '@angular/router';

import { authRoleGuard, authRoleChildGuard } from './core/auth/guards/auth-guard';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AgentLayoutComponent } from './layouts/agent-layout/agent-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';

import { LoginAdminComponent } from './auth/admin-auth/pages/login-admin.component';
import { LoginAgentComponent } from './auth/agent-auth/pages/login-agent.component';
import { LoginClientComponent } from './auth/client-auth/pages/login-client.component';
import { SignupClientComponent } from './auth/client-auth/pages/signup-client.component';

import { DashboardPage as AdminDashboardPage } from './admin/dashboard/pages/dashboard.page';
import { AgentDashboardPage } from './agent/dashboard/dashboard.page';
import { ClientDashboardPage } from './client/dashboard/dashboard.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/client/login',
    pathMatch: 'full',
  },

  // PUBLIC AUTH ROUTES
  {
    path: 'auth/admin/login',
    component: LoginAdminComponent,
  },
  {
    path: 'auth/agent/login',
    component: LoginAgentComponent,
  },
  {
    path: 'auth/client/login',
    component: LoginClientComponent,
  },
  {
    path: 'auth/client/signup',
    component: SignupClientComponent,
  },
  {
    path: 'auth/verify-email',
    loadComponent: () =>
      import('./auth/client-auth/pages/verify-email/verify-email.component')
        .then(m => m.VerifyEmailComponent),
  },

  // OLD AUTH ROUTES KEPT AS REDIRECTS
  {
    path: 'login-admin',
    redirectTo: 'auth/admin/login',
    pathMatch: 'full',
  },
  {
    path: 'login-agent',
    redirectTo: 'auth/agent/login',
    pathMatch: 'full',
  },
  {
    path: 'login-client',
    redirectTo: 'auth/client/login',
    pathMatch: 'full',
  },
  {
    path: 'signup-client',
    redirectTo: 'auth/client/signup',
    pathMatch: 'full',
  },

  // ADMIN PROTECTED ROUTES
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authRoleGuard(['ADMIN'])],
    canActivateChild: [authRoleChildGuard(['ADMIN'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: AdminDashboardPage,
      },

      // Admin agencies routes
      {
        path: 'agencies',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./admin/agencies/components/agency-list/agency-list.component')
                .then(m => m.AgencyListComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./admin/agencies/components/agency-form/agency-form.component')
                .then(m => m.AgencyFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./admin/agencies/components/agency-form/agency-form.component')
                .then(m => m.AgencyFormComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./admin/agencies/components/agency-details/agency-details.component')
                .then(m => m.AgencyDetailsComponent),
          },
        ],
      },

      // Admin agents routes
      {
        path: 'agents',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./admin/agents/components/agent-list/agent-list.component')
                .then(m => m.AgentListComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./admin/agents/components/agent-form/agent-form.component')
                .then(m => m.AgentFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./admin/agents/components/agent-form/agent-form.component')
                .then(m => m.AgentFormComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./admin/agents/components/agent-details/agent-details.component')
                .then(m => m.AgentDetailsComponent),
          },
        ],
      },

      // Admin configuration routes
      {
        path: 'corridors',
        loadComponent: () =>
          import('./admin/corridors/pages/list.page')
            .then(m => m.CorridorsListPage),
      },
      {
        path: 'corridors/create',
        loadComponent: () =>
          import('./admin/corridors/pages/create.page')
            .then(m => m.CorridorsCreatePage),
      },
      {
        path: 'corridors/:id/edit',
        loadComponent: () =>
          import('./admin/corridors/pages/edit.page')
            .then(m => m.CorridorsEditPage),
      },
      {
        path: 'devises',
        loadComponent: () =>
          import('./admin/currencies/pages/devises/devises.page')
            .then(m => m.DevisesPage),
      },
      {
        path: 'currencies',
        loadComponent: () =>
          import('./admin/currencies/pages/list.page')
            .then(m => m.CurrenciesListPage),
      },
      {
        path: 'currencies/create',
        loadComponent: () =>
          import('./admin/currencies/pages/create.page')
            .then(m => m.CurrenciesCreatePage),
      },
      {
        path: 'currencies/:id/edit',
        loadComponent: () =>
          import('./admin/currencies/pages/edit.page')
            .then(m => m.CurrenciesEditPage),
      },
      {
        path: 'rates',
        loadComponent: () =>
          import('./admin/rates/pages/list.page')
            .then(m => m.RatesListPage),
      },
      {
        path: 'fees',
        loadComponent: () =>
          import('./admin/fees/pages/list.page')
            .then(m => m.FeesListPage),
      },
      {
        path: 'fees/create',
        loadComponent: () =>
          import('./admin/fees/pages/create.page')
            .then(m => m.FeesCreatePage),
      },
      {
        path: 'fees/:id/edit',
        loadComponent: () =>
          import('./admin/fees/pages/edit.page')
            .then(m => m.FeesEditPage),
      },

      // Admin cash register routes
      {
        path: 'cash-registers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./admin/cash-registers/pages/list.page')
                .then(m => m.AdminCashRegisterListPage),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./admin/cash-registers/pages/create.page')
                .then(m => m.AdminCashRegisterCreatePage),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./admin/cash-registers/pages/detail.page')
                .then(m => m.AdminCashRegisterDetailPage),
          },
        ],
      },

      // Admin reports and audit routes
      {
        path: 'reports',
        loadComponent: () =>
          import('./admin/reports/pages/list.page')
            .then(m => m.ReportsListPage),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./admin/audit/pages/list.page')
            .then(m => m.AuditListPage),
      },
    ],
  },

  // AGENT PROTECTED ROUTES
  {
    path: 'agent',
    component: AgentLayoutComponent,
    canActivate: [authRoleGuard(['AGENT'])],
    canActivateChild: [authRoleChildGuard(['AGENT'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: AgentDashboardPage,
      },

      // Agent transfer routes
      {
        path: 'transfers',
        children: [
          {
            path: 'create',
            loadComponent: () =>
              import('./agent/transfers/create/transfer-create.page')
                .then(m => m.TransferCreatePage),
          },
          {
            path: 'receive',
            loadComponent: () =>
              import('./agent/transfers/receive/transfer-receive.page')
                .then(m => m.TransferReceivePage),
          },
          {
            path: 'receipt/:code',
            loadComponent: () =>
              import('./agent/transfers/receipt/transfer-receipt.page')
                .then(m => m.TransferReceiptPage),
          },
          {
            path: 'history',
            loadComponent: () =>
              import('./agent/transfers/history/transfer-history.page')
                .then(m => m.TransferHistoryPage),
          },
        ],
      },

      // Agent cash routes
      {
        path: 'cash',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./agent/cash/cash-management.component')
                .then(m => m.CashManagementComponent),
          },

        ],
      },
    ],
  },

  // CLIENT PROTECTED ROUTES
  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [authRoleGuard(['CLIENT'])],
    canActivateChild: [authRoleChildGuard(['CLIENT'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: ClientDashboardPage,
      },

      // Client transfers routes
      {
        path: 'transfers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./client/transfers/list/transfer-list.page')
                .then(m => m.TransferListPage),
          },
          {
            path: 'details/:code',
            loadComponent: () =>
              import('./client/transfers/details/transfer-details.page')
                .then(m => m.TransferDetailsPage),
          },
        ],
      },

      // Client notifications
      {
        path: 'notifications',
        loadComponent: () =>
          import('./client/notifications/notifications.page')
            .then(m => m.NotificationsPage),
      },

      // Client profile
      {
        path: 'profile',
        loadComponent: () =>
          import('./client/profile/edit-profile.component')
            .then(m => m.EditProfileComponent),
      },
    ],
  },

  // UNAUTHORIZED PAGE
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized.component')
        .then(m => m.UnauthorizedComponent),
  },

  // FALLBACK
  {
    path: '**',
    redirectTo: 'auth/client/login',
  },
];
