import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'ct-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {

}
