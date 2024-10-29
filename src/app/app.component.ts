import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { AuthStateService } from './shared/data-access/auth-state.service';
import { initFlowbite } from 'flowbite';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'andes-gatekeeper';
  private _authState = inject(AuthStateService);
  private _router = inject(Router);
  async logOut(){
    await this._authState.logOut();
    this._router.navigateByUrl('/auth/sign-in');
  }

  ngOnInit(): void{
    initFlowbite();
  }
}
