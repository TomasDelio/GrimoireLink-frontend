import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth-service';
import { UserService } from '../../auth/data-access/user-service';
import { UserResponse } from '../../auth/data-access/auth.model';
import { FormsModule } from '@angular/forms';
import { CampaignContextService } from '../../campaigns/data-access/campaign-context-service';

@Component({
  imports: [RouterLink,FormsModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit{
  
 protected readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly campaignContext = inject(CampaignContextService);

  user = signal<UserResponse | null>(null);

  nickname = signal('');
  nicknameInput = signal('');
  isEditing = signal(false);

  displayName = computed(() =>
    this.nickname() || this.user()?.name || 'Usuario'
  );

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.loadUser();
    }
  }

  loadUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: user => {
        this.user.set(user);

        const savedName = localStorage.getItem(
          `grimoirelink:nickname:${user.publicId}`
        );

        this.nickname.set(savedName || '');
      },
      error: () => {
        this.user.set(null);
      }
    });
  }

  openEditor(): void {
    this.nicknameInput.set(this.displayName());
    this.isEditing.set(true);
  }

  saveNickname(): void {
    const name = this.nicknameInput().trim();
    const user = this.user();

    if (!user || name.length < 3 || name.length > 24) {
      return;
    }

    localStorage.setItem(
      `grimoirelink:nickname:${user.publicId}`,
      name
    );

    this.nickname.set(name);
    this.isEditing.set(false);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.user.set(null);
    this.nickname.set('');
    this.isEditing.set(false);
    this.campaignContext.reset();
    this.router.navigate(['/']);
  }

}