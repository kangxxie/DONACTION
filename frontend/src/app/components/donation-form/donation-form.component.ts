import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationService } from '../../services/donation.service';
import { Donation } from '../../models/donation.model';

@Component({
  selector: 'app-donation-form',
  templateUrl: './donation-form.component.html',
  styleUrls: ['./donation-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DonationFormComponent implements OnInit {
  donationForm!: FormGroup;
  errorMessage: string = '';
  // Assuming campaignId is passed as a route parameter
  campaignId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private donationService: DonationService
  ) { 
    this.donationForm = this.fb.group({
      donor_name: [''],
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.campaignId = Number(this.route.snapshot.paramMap.get('id'));
    this.donationForm = this.fb.group({
      donor_name: [''],
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.donationForm.invalid) return;
    const don: Partial<Donation> = {
      campaign_id: this.campaignId,
      donor_name: this.donationForm.value.donor_name,
      amount: this.donationForm.value.amount
    };
    this.donationService.donate(don).subscribe(
      () => {
        alert('Donazione eseguita!');
        this.router.navigate(['/campaigns', this.campaignId]);
      },
      err => console.error(err)
    );
  }
}

