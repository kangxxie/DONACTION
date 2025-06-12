import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../models/campaign.model';

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CampaignDetailComponent implements OnInit {
  campaign: Campaign | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private campaignService: CampaignService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.campaignService.getById(id).subscribe(
      data => this.campaign = data,
      err => console.error(err)
    );
  }

  goToDonate(): void {
    if (this.campaign) {
      this.router.navigate(['/donate', this.campaign.id]);
    }
  }
}

