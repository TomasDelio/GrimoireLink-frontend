import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampaignJoin } from './campaign-join';

describe('CampaignJoin', () => {
  let component: CampaignJoin;
  let fixture: ComponentFixture<CampaignJoin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignJoin],
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignJoin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
