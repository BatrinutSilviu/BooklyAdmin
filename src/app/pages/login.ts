import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="w-full max-w-[440px] flex flex-col gap-10 mx-auto my-auto">
      <!-- Logo Section -->
      <div class="flex flex-col items-center gap-5">
        <div class="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 ring-4 ring-primary/10">
          <mat-icon class="text-white !text-3xl">auto_stories</mat-icon>
        </div>
        <div class="text-center">
          <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">StoryAdmin</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your narratives with precision</p>
        </div>
      </div>

      <!-- Login Card -->
      <div class="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl backdrop-blur-md">
        <div class="mb-8 text-center">
          <h2 class="text-2xl font-bold dark:text-white">Welcome back</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter your details to access your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
          <!-- Error Message -->
          @if (error()) {
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <mat-icon class="!text-sm">error_outline</mat-icon>
              {{ error() }}
            </div>
          }

          <!-- Email Field -->
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Email Address</label>
            <div class="relative group">
              <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors !text-xl">mail</mat-icon>
              <input 
                id="email"
                formControlName="email"
                class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="name@company.com" 
                type="email"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center ml-0.5">
              <label for="password" class="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <a class="text-xs font-semibold text-primary hover:text-primary/80 transition-colors" href="javascript:void(0)">Forgot password?</a>
            </div>
            <div class="relative group">
              <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors !text-xl">lock</mat-icon>
              <input 
                id="password"
                formControlName="password"
                class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-12 pr-12 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="••••••••" 
                [type]="showPassword ? 'text' : 'password'"
              />
              <button 
                (click)="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" 
                type="button"
              >
                <mat-icon class="!text-xl">{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center gap-3 py-1">
            <input class="checkbox-custom w-5 h-5 rounded border-slate-300 dark:border-slate-800 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all" id="remember" type="checkbox"/>
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none" for="remember">Keep me logged in</label>
          </div>

          <!-- Submit Button -->
          <button 
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2" 
            type="submit"
          >
            @if (isLoading()) {
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing In...</span>
            } @else {
              <span>Sign In</span>
              <mat-icon class="!text-xl">arrow_forward</mat-icon>
            }
          </button>
        </form>

        <!-- Social/Alternative Login -->
        <div class="mt-10 flex flex-col gap-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div class="relative flex justify-center text-xs font-bold uppercase tracking-wider">
              <span class="bg-white dark:bg-[#121a2e] px-4 text-slate-500 dark:text-slate-500">Or continue with</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <button class="flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.98]">
              <img src="https://www.google.com/favicon.ico" class="w-5 h-5" referrerpolicy="no-referrer" alt="Google" />
              <span class="text-sm font-bold dark:text-slate-200">Google</span>
            </button>
            <button class="flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.98]">
              <img src="https://github.com/favicon.ico" class="w-5 h-5 dark:invert" referrerpolicy="no-referrer" alt="GitHub" />
              <span class="text-sm font-bold dark:text-slate-200">GitHub</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        Don't have an account? 
        <a class="text-primary font-bold hover:underline transition-all" href="javascript:void(0)">Create an account</a>
      </p>

      <!-- Decorative elements -->
      <div class="fixed -z-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -top-64 -left-64 pointer-events-none animate-pulse"></div>
      <div class="fixed -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -bottom-64 -right-64 pointer-events-none animate-pulse" style="animation-delay: 2s"></div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      min-height: 100vh;
      width: 100%;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  showPassword = false;

  error = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.error.set(null);
      this.auth.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.error?.message || 'Invalid email or password');
        }
      });
    }
  }
}
