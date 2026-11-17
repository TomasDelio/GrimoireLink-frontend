import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth-service';
import { UserService } from '../../auth/data-access/user-service';
import { UserResponse } from '../../auth/data-access/auth.model';
import { FormsModule } from '@angular/forms';
import { CampaignContextService } from '../../campaigns/data-access/campaign-context-service';


interface ProfileAvatar {
  id: string;
  name: string;
}

@Component({
  imports: [RouterLink,FormsModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit{

  protected readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly campaignContext = inject(CampaignContextService);
  private readonly router = inject(Router);

  readonly avatars: ProfileAvatar[] = [
    { id: 'wizard', name: 'Mago' },
    { id: 'witch', name: 'Bruja' },
    { id: 'warlock', name: 'Brujo' },
    { id: 'assassin', name: 'Asesino' },
    { id: 'rogue', name: 'Picaro' },
    { id: 'archer', name: 'Arquero' },
    { id: 'elf', name: 'Elfa' },
    { id: 'dwarf', name: 'Enano' },
    { id: 'dwarf-king', name: 'Rey enano' },
    { id: 'priest', name: 'Sacerdote' },
    { id: 'knight', name: 'Caballero' },
    { id: 'vampire', name: 'Vampiro' },
    { id: 'orc', name: 'Orco' },
    { id: 'goblin', name: 'Goblin' },
    { id: 'kenku', name: 'Kenku' }
  ];

  user = signal<UserResponse | null>(null);

  nickname = signal('');
  nicknameInput = signal('');

  selectedAvatar = signal('wizard');
  avatarInput = signal('wizard');

  isEditing = signal(false);

  displayName = computed(() =>
    this.nickname() || this.user()?.name || 'Usuario'
  );

  avatarUrl = computed(() =>
    this.getAvatarUrl(this.selectedAvatar())
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

        const savedAvatar = localStorage.getItem(
          `grimoirelink:avatar:${user.publicId}`
        );

        this.nickname.set(savedName || '');

        const avatarExists = this.avatars.some(
          avatar => avatar.id === savedAvatar
        );

        this.selectedAvatar.set(
          avatarExists && savedAvatar ? savedAvatar : 'wizard'
        );
      },
      error: () => {
        this.user.set(null);
      }
    });
  }

  getAvatarUrl(avatarId: string): string {
    return `/avatars/${avatarId}.png`;
  }

  openEditor(): void {
    this.nicknameInput.set(this.displayName());
    this.avatarInput.set(this.selectedAvatar());
    this.isEditing.set(true);
  }

  selectAvatar(avatarId: string): void {
    const exists = this.avatars.some(
      avatar => avatar.id === avatarId
    );

    if (exists) {
      this.avatarInput.set(avatarId);
    }
  }

  saveProfile(): void {
    const name = this.nicknameInput().trim();
    const user = this.user();

    if (!user || name.length < 3 || name.length > 24) {
      return;
    }

    localStorage.setItem(
      `grimoirelink:nickname:${user.publicId}`,
      name
    );

    localStorage.setItem(
      `grimoirelink:avatar:${user.publicId}`,
      this.avatarInput()
    );

    this.nickname.set(name);
    this.selectedAvatar.set(this.avatarInput());
    this.isEditing.set(false);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.campaignContext.reset();

    this.user.set(null);
    this.nickname.set('');
    this.selectedAvatar.set('wizard');
    this.isEditing.set(false);

    this.router.navigate(['/']);
  }

}