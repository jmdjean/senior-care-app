import { Component, HostBinding, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MenuComponent } from '../menu/menu.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-layout',
  imports: [MenuComponent, TopbarComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);

  @HostBinding('class.menu-open') menuOpen = false;

  ngOnInit(): void {
    this.authService.initializeUser();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.syncMenuState();
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.syncMenuState();
  }

  private syncMenuState(): void {
    const navbar = document.querySelector('.pcoded-navbar');
    if (navbar) {
      navbar.classList.toggle('mob-open', this.menuOpen);
    }
    document.body.classList.toggle('menu-open', this.menuOpen);
  }
}
