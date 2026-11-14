# Proof that each rule catches

Each rule is broken on purpose by injecting a violating element (or style) into the built page at 1280px, on the LAST screen (footer), the last section, and a middle section of every page; the audit must report that rule on that exact screen. The source is not touched, so there is nothing to restore.

| page | rule | target | screen | result | detail |
|---|---|---|---|---|---|
| / | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| / | R1 | last-section | Ask us anything about your property | CAUGHT | 1008.7 (required container 40 or a column/card edge) |
| / | R1 | middle | Proof you can check | CAUGHT | 53 (required container 40 or a column/card edge) |
| / | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| / | R2 | last-section | Ask us anything about your property | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| / | R2 | middle | Proof you can check | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| / | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| / | R3 | last-section | Ask us anything about your property | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| / | R3 | middle | Proof you can check | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| / | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| / | R4 | last-section | Ask us anything about your property | CAUGHT | 0 (required paragraph -> paragraph 16) |
| / | R4 | middle | Proof you can check | CAUGHT | 12 (required heading -> text 16) |
| / | R5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| / | R5 | last-section | Ask us anything about your property | CAUGHT | 7 (required padding-top 112) |
| / | R5 | middle | Proof you can check | CAUGHT | 7 (required padding-top 112) |
| / | R6 | last | footer | CAUGHT | 900 (required max 720) |
| / | R6 | last-section | Ask us anything about your property | CAUGHT | 900 (required max 720) |
| / | R6 | middle | Proof you can check | CAUGHT | 900 (required max 720) |
| / | R7 | last | footer | CAUGHT | 2 columns (required 3 columns) |
| / | R7 | last-section | Ask us anything about your property | CAUGHT | 2 columns (required 3 columns) |
| / | R7 | middle | Proof you can check | CAUGHT | 2 columns (required 3 columns) |
| / | R8 | last | footer | CAUGHT | 40 (required height 52) |
| / | R8 | last-section | Ask us anything about your property | CAUGHT | 40 (required height 52) |
| / | R8 | middle | Proof you can check | CAUGHT | 40 (required height 52) |
| / | R9 | last | footer | CAUGHT | disc (required list-style none (markers come from List)) |
| / | R9 | last-section | Ask us anything about your property | CAUGHT | disc (required list-style none (markers come from List)) |
| / | R9 | middle | Proof you can check | CAUGHT | disc (required list-style none (markers come from List)) |
| / | X | last | footer | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| / | X | last-section | Ask us anything about your property | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| / | X | middle | Proof you can check | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| / | D1 | last | footer | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| / | D1 | last-section | Ask us anything about your property | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| / | D1 | middle | Proof you can check | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| / | D2 | last | footer | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| / | D2 | last-section | Ask us anything about your property | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| / | D2 | middle | Proof you can check | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| / | D3 | last | footer | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| / | D3 | last-section | Ask us anything about your property | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| / | D3 | middle | Proof you can check | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| / | D4 | last | footer | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| / | D4 | last-section | Ask us anything about your property | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| / | D4 | middle | Proof you can check | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| / | D5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| / | D5 | last-section | Ask us anything about your property | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| / | D5 | middle | Proof you can check | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| / | D6 | last | footer | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| / | D6 | last-section | Ask us anything about your property | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| / | D6 | middle | Proof you can check | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| / | D7 | last | footer | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| / | D7 | last-section | Ask us anything about your property | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| / | D7 | middle | Proof you can check | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| / | D8 | last | footer | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| / | D8 | last-section | Ask us anything about your property | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| / | D8 | middle | Proof you can check | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| / | D9 | last | footer | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| / | D9 | last-section | Ask us anything about your property | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| / | D9 | middle | Proof you can check | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /404 | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /404 | R1 | last-section | Page not found. | CAUGHT | 53 (required container 40 or a column/card edge) |
| /404 | R1 | middle | Page not found. | CAUGHT | 53 (required container 40 or a column/card edge) |
| /404 | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /404 | R2 | last-section | Page not found. | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /404 | R2 | middle | Page not found. | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /404 | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /404 | R3 | last-section | Page not found. | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /404 | R3 | middle | Page not found. | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /404 | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /404 | R4 | last-section | Page not found. | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /404 | R4 | middle | Page not found. | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /404 | R5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /404 | R5 | last-section | Page not found. | CAUGHT | 7 (required padding-top 80) |
| /404 | R5 | middle | Page not found. | CAUGHT | 7 (required padding-top 80) |
| /404 | R6 | last | footer | CAUGHT | 900 (required max 720) |
| /404 | R6 | last-section | Page not found. | CAUGHT | 900 (required max 720) |
| /404 | R6 | middle | Page not found. | CAUGHT | 900 (required max 720) |
| /404 | R7 | last | footer | CAUGHT | 2 columns (required 3 columns) |
| /404 | R7 | last-section | Page not found. | CAUGHT | 2 columns (required 3 columns) |
| /404 | R7 | middle | Page not found. | CAUGHT | 2 columns (required 3 columns) |
| /404 | R8 | last | footer | CAUGHT | 40 (required height 52) |
| /404 | R8 | last-section | Page not found. | CAUGHT | 40 (required height 52) |
| /404 | R8 | middle | Page not found. | CAUGHT | 40 (required height 52) |
| /404 | R9 | last | footer | CAUGHT | disc (required list-style none (markers come from List)) |
| /404 | R9 | last-section | Page not found. | CAUGHT | disc (required list-style none (markers come from List)) |
| /404 | R9 | middle | Page not found. | CAUGHT | disc (required list-style none (markers come from List)) |
| /404 | X | last | footer | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /404 | X | last-section | Page not found. | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /404 | X | middle | Page not found. | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /404 | D1 | last | footer | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /404 | D1 | last-section | Page not found. | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /404 | D1 | middle | Page not found. | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /404 | D2 | last | footer | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /404 | D2 | last-section | Page not found. | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /404 | D2 | middle | Page not found. | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /404 | D3 | last | footer | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /404 | D3 | last-section | Page not found. | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /404 | D3 | middle | Page not found. | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /404 | D4 | last | footer | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /404 | D4 | last-section | Page not found. | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /404 | D4 | middle | Page not found. | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /404 | D5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /404 | D5 | last-section | Page not found. | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /404 | D5 | middle | Page not found. | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /404 | D6 | last | footer | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /404 | D6 | last-section | Page not found. | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /404 | D6 | middle | Page not found. | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /404 | D7 | last | footer | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /404 | D7 | last-section | Page not found. | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /404 | D7 | middle | Page not found. | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /404 | D8 | last | footer | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /404 | D8 | last-section | Page not found. | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /404 | D8 | middle | Page not found. | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /404 | D9 | last | footer | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /404 | D9 | last-section | Page not found. | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /404 | D9 | middle | Page not found. | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /due-diligence | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /due-diligence | R1 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 1051.1 (required container 40 or a column/card edge) |
| /due-diligence | R1 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 1094.9 (required container 40 or a column/card edge) |
| /due-diligence | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /due-diligence | R2 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /due-diligence | R2 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /due-diligence | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /due-diligence | R3 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /due-diligence | R3 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /due-diligence | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /due-diligence | R4 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /due-diligence | R4 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /due-diligence | R5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /due-diligence | R5 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 7 (required padding-top 112) |
| /due-diligence | R5 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 7 (required padding-top 112) |
| /due-diligence | R6 | last | footer | CAUGHT | 900 (required max 720) |
| /due-diligence | R6 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 900 (required max 720) |
| /due-diligence | R6 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 900 (required max 720) |
| /due-diligence | R7 | last | footer | CAUGHT | 2 columns (required 3 columns) |
| /due-diligence | R7 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 2 columns (required 3 columns) |
| /due-diligence | R7 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 2 columns (required 3 columns) |
| /due-diligence | R8 | last | footer | CAUGHT | 40 (required height 52) |
| /due-diligence | R8 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 40 (required height 52) |
| /due-diligence | R8 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 40 (required height 52) |
| /due-diligence | R9 | last | footer | CAUGHT | disc (required list-style none (markers come from List)) |
| /due-diligence | R9 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | disc (required list-style none (markers come from List)) |
| /due-diligence | R9 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | disc (required list-style none (markers come from List)) |
| /due-diligence | X | last | footer | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /due-diligence | X | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /due-diligence | X | middle | Choose the Depth of Your Check. #pricing | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /due-diligence | D1 | last | footer | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /due-diligence | D1 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /due-diligence | D1 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /due-diligence | D2 | last | footer | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /due-diligence | D2 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /due-diligence | D2 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /due-diligence | D3 | last | footer | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /due-diligence | D3 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /due-diligence | D3 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /due-diligence | D4 | last | footer | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /due-diligence | D4 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /due-diligence | D4 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /due-diligence | D5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /due-diligence | D5 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /due-diligence | D5 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /due-diligence | D6 | last | footer | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /due-diligence | D6 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /due-diligence | D6 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /due-diligence | D7 | last | footer | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /due-diligence | D7 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /due-diligence | D7 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /due-diligence | D8 | last | footer | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /due-diligence | D8 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /due-diligence | D8 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /due-diligence | D9 | last | footer | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /due-diligence | D9 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /due-diligence | D9 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /platform | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /platform | R1 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 827.4 (required container 40 or a column/card edge) |
| /platform | R1 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 1076.3 (required container 40 or a column/card edge) |
| /platform | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /platform | R2 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /platform | R2 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /platform | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /platform | R3 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /platform | R3 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /platform | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /platform | R4 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /platform | R4 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /platform | R5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /platform | R5 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 7 (required padding-top 112) |
| /platform | R5 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 7 (required padding-top 112) |
| /platform | R6 | last | footer | CAUGHT | 900 (required max 720) |
| /platform | R6 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 900 (required max 720) |
| /platform | R6 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 900 (required max 720) |
| /platform | R7 | last | footer | CAUGHT | 2 columns (required 3 columns) |
| /platform | R7 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 2 columns (required 3 columns) |
| /platform | R7 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 2 columns (required 3 columns) |
| /platform | R8 | last | footer | CAUGHT | 40 (required height 52) |
| /platform | R8 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 40 (required height 52) |
| /platform | R8 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 40 (required height 52) |
| /platform | R9 | last | footer | CAUGHT | disc (required list-style none (markers come from List)) |
| /platform | R9 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | disc (required list-style none (markers come from List)) |
| /platform | R9 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | disc (required list-style none (markers come from List)) |
| /platform | X | last | footer | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /platform | X | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /platform | X | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /platform | D1 | last | footer | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /platform | D1 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /platform | D1 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /platform | D2 | last | footer | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /platform | D2 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /platform | D2 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /platform | D3 | last | footer | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /platform | D3 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D3 rows 284 in a column of 1200 (required rows span the container) |
| /platform | D3 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D3 rows 284 in a column of 1200 (required rows span the container) |
| /platform | D4 | last | footer | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /platform | D4 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /platform | D4 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /platform | D5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /platform | D5 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /platform | D5 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /platform | D6 | last | footer | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /platform | D6 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /platform | D6 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /platform | D7 | last | footer | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /platform | D7 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D7 marker 84px off the first line (required within 3px of the first line) |
| /platform | D7 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D7 marker 84px off the first line (required within 3px of the first line) |
| /platform | D8 | last | footer | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /platform | D8 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /platform | D8 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /platform | D9 | last | footer | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /platform | D9 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /platform | D9 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /regulations | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /regulations | R1 | last-section | Primary legal and government sources #sources | CAUGHT | 53 (required container 40 or a column/card edge) |
| /regulations | R1 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 170.5 (required container 40 or a column/card edge) |
| /regulations | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /regulations | R2 | last-section | Primary legal and government sources #sources | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /regulations | R2 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /regulations | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /regulations | R3 | last-section | Primary legal and government sources #sources | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /regulations | R3 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /regulations | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /regulations | R4 | last-section | Primary legal and government sources #sources | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /regulations | R4 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 12 (required heading -> text 16) |
| /regulations | R5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /regulations | R5 | last-section | Primary legal and government sources #sources | CAUGHT | 7 (required padding-top 112) |
| /regulations | R5 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 7 (required padding-top 0 (same background as the previous screen)) |
| /regulations | R6 | last | footer | CAUGHT | 900 (required max 720) |
| /regulations | R6 | last-section | Primary legal and government sources #sources | CAUGHT | 900 (required max 720) |
| /regulations | R6 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 900 (required max 720) |
| /regulations | R7 | last | footer | CAUGHT | 2 columns (required 3 columns) |
| /regulations | R7 | last-section | Primary legal and government sources #sources | CAUGHT | 2 columns (required 3 columns) |
| /regulations | R7 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 2 columns (required 3 columns) |
| /regulations | R8 | last | footer | CAUGHT | 40 (required height 52) |
| /regulations | R8 | last-section | Primary legal and government sources #sources | CAUGHT | 40 (required height 52) |
| /regulations | R8 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 40 (required height 52) |
| /regulations | R9 | last | footer | CAUGHT | disc (required list-style none (markers come from List)) |
| /regulations | R9 | last-section | Primary legal and government sources #sources | CAUGHT | disc (required list-style none (markers come from List)) |
| /regulations | R9 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | disc (required list-style none (markers come from List)) |
| /regulations | X | last | footer | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /regulations | X | last-section | Primary legal and government sources #sources | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /regulations | X | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /regulations | D1 | last | footer | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /regulations | D1 | last-section | Primary legal and government sources #sources | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /regulations | D1 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /regulations | D2 | last | footer | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /regulations | D2 | last-section | Primary legal and government sources #sources | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /regulations | D2 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /regulations | D3 | last | footer | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /regulations | D3 | last-section | Primary legal and government sources #sources | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /regulations | D3 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /regulations | D4 | last | footer | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /regulations | D4 | last-section | Primary legal and government sources #sources | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /regulations | D4 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /regulations | D5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /regulations | D5 | last-section | Primary legal and government sources #sources | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /regulations | D5 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /regulations | D6 | last | footer | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /regulations | D6 | last-section | Primary legal and government sources #sources | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /regulations | D6 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /regulations | D7 | last | footer | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /regulations | D7 | last-section | Primary legal and government sources #sources | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /regulations | D7 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /regulations | D8 | last | footer | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /regulations | D8 | last-section | Primary legal and government sources #sources | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /regulations | D8 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /regulations | D9 | last | footer | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /regulations | D9 | last-section | Primary legal and government sources #sources | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /regulations | D9 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /styleguide | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /styleguide | R1 | last-section | What a property compliance audit checks #audit | CAUGHT | 239.3 (required container 40 or a column/card edge) |
| /styleguide | R1 | middle | Proof you can check | CAUGHT | 53 (required container 40 or a column/card edge) |
| /styleguide | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /styleguide | R2 | last-section | What a property compliance audit checks #audit | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /styleguide | R2 | middle | Proof you can check | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /styleguide | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /styleguide | R3 | last-section | What a property compliance audit checks #audit | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /styleguide | R3 | middle | Proof you can check | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none / control 15px sans w500 none) |
| /styleguide | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /styleguide | R4 | last-section | What a property compliance audit checks #audit | CAUGHT | 0 (required gap >= 4 between the visible content of this element and the next (stuck pair)) |
| /styleguide | R4 | middle | Proof you can check | CAUGHT | 12 (required heading -> text 16) |
| /styleguide | R5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /styleguide | R5 | last-section | What a property compliance audit checks #audit | CAUGHT | 7 (required padding-top 112) |
| /styleguide | R5 | middle | Proof you can check | CAUGHT | 7 (required padding-top 0 (same background as the previous screen)) |
| /styleguide | R6 | last | footer | CAUGHT | 900 (required max 720) |
| /styleguide | R6 | last-section | What a property compliance audit checks #audit | CAUGHT | 900 (required max 720) |
| /styleguide | R6 | middle | Proof you can check | CAUGHT | 900 (required max 720) |
| /styleguide | R7 | last | footer | CAUGHT | 2 columns (required 3 columns) |
| /styleguide | R7 | last-section | What a property compliance audit checks #audit | CAUGHT | 2 columns (required 3 columns) |
| /styleguide | R7 | middle | Proof you can check | CAUGHT | 2 columns (required 3 columns) |
| /styleguide | R8 | last | footer | CAUGHT | 40 (required height 52) |
| /styleguide | R8 | last-section | What a property compliance audit checks #audit | CAUGHT | 40 (required height 52) |
| /styleguide | R8 | middle | Proof you can check | CAUGHT | 40 (required height 52) |
| /styleguide | R9 | last | footer | CAUGHT | disc (required list-style none (markers come from List)) |
| /styleguide | R9 | last-section | What a property compliance audit checks #audit | CAUGHT | disc (required list-style none (markers come from List)) |
| /styleguide | R9 | middle | Proof you can check | CAUGHT | disc (required list-style none (markers come from List)) |
| /styleguide | X | last | footer | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /styleguide | X | last-section | What a property compliance audit checks #audit | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /styleguide | X | middle | Proof you can check | CAUGHT | screen content 3040px in a screen of 1280px (required nothing wider than the screen) |
| /styleguide | D1 | last | footer | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /styleguide | D1 | last-section | What a property compliance audit checks #audit | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /styleguide | D1 | middle | Proof you can check | CAUGHT | D1 height 120 in a row of 240 (required equal heights in one row) |
| /styleguide | D2 | last | footer | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /styleguide | D2 | last-section | What a property compliance audit checks #audit | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /styleguide | D2 | middle | Proof you can check | CAUGHT | D2 button bottom 0px off, 103px above the card bottom (required one line, at the card bottom) |
| /styleguide | D3 | last | footer | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /styleguide | D3 | last-section | What a property compliance audit checks #audit | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /styleguide | D3 | middle | Proof you can check | CAUGHT | D3 rows 720 in a column of 1200 (required rows span the container) |
| /styleguide | D4 | last | footer | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /styleguide | D4 | last-section | What a property compliance audit checks #audit | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /styleguide | D4 | middle | Proof you can check | CAUGHT | D4 empty run 371px, content 5% of the box (required empty run <= 160px, content >= 35%) |
| /styleguide | D5 | last | footer | n/a | not applicable here (R5: sections only, see last-section; R2 on /404: one screen only) |
| /styleguide | D5 | last-section | What a property compliance audit checks #audit | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /styleguide | D5 | middle | Proof you can check | CAUGHT | D5 empty band 265px (required no empty band > 120px) |
| /styleguide | D6 | last | footer | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /styleguide | D6 | last-section | What a property compliance audit checks #audit | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /styleguide | D6 | middle | Proof you can check | CAUGHT | D6 orphan: 1 item in the last row of 2 (required no orphan item) |
| /styleguide | D7 | last | footer | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /styleguide | D7 | last-section | What a property compliance audit checks #audit | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /styleguide | D7 | middle | Proof you can check | CAUGHT | D7 marker 28px off the first line (required within 3px of the first line) |
| /styleguide | D8 | last | footer | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /styleguide | D8 | last-section | What a property compliance audit checks #audit | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /styleguide | D8 | middle | Proof you can check | CAUGHT | D8 prices 250, 90 (required ascending by price) |
| /styleguide | D9 | last | footer | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /styleguide | D9 | last-section | What a property compliance audit checks #audit | CAUGHT | D9 button transition: none (required hover motion (transform)) |
| /styleguide | D9 | middle | Proof you can check | CAUGHT | D9 button transition: none (required hover motion (transform)) |

Caught 328 of 328; not applicable 14; NOT CAUGHT 0.
