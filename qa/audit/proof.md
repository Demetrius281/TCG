# Proof that each rule catches

Each rule is broken on purpose by injecting a violating element (or style) into the built page at 1280px, on the LAST screen (footer), the last section, and a middle section of every page; the audit must report that rule on that exact screen. The source is not touched, so there is nothing to restore.

| page | rule | target | screen | result | detail |
|---|---|---|---|---|---|
| / | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| / | R1 | last-section | Ask us anything about your property | CAUGHT | 53 (required container 40 or a column/card edge) |
| / | R1 | middle | Proof you can check | CAUGHT | 53 (required container 40 or a column/card edge) |
| / | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| / | R2 | last-section | Ask us anything about your property | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| / | R2 | middle | Proof you can check | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| / | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| / | R3 | last-section | Ask us anything about your property | CAUGHT | 15px sans w500 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| / | R3 | middle | Proof you can check | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| / | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| / | R4 | last-section | Ask us anything about your property | CAUGHT | 0 (required paragraph -> paragraph 16) |
| / | R4 | middle | Proof you can check | CAUGHT | 12 (required heading -> text 16) |
| / | R5 | last | footer | n/a | rule applies to sections only; see last-section |
| / | R5 | last-section | Ask us anything about your property | CAUGHT | 7 (required padding-top 112) |
| / | R5 | middle | Proof you can check | CAUGHT | 7 (required padding-top 112) |
| / | R6 | last | footer | CAUGHT | 1200 (required max 720) |
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
| / | X | last-section | Ask us anything about your property | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| / | X | middle | Proof you can check | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /due-diligence | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /due-diligence | R1 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 53 (required container 40 or a column/card edge) |
| /due-diligence | R1 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 706.5 (required container 40 or a column/card edge) |
| /due-diligence | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /due-diligence | R2 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /due-diligence | R2 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /due-diligence | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /due-diligence | R3 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 15px sans w500 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /due-diligence | R3 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 15px mono w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /due-diligence | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /due-diligence | R4 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /due-diligence | R4 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /due-diligence | R5 | last | footer | n/a | rule applies to sections only; see last-section |
| /due-diligence | R5 | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | 7 (required padding-top 112) |
| /due-diligence | R5 | middle | Choose the Depth of Your Check. #pricing | CAUGHT | 7 (required padding-top 112) |
| /due-diligence | R6 | last | footer | CAUGHT | 1200 (required max 720) |
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
| /due-diligence | X | last-section | Check the Property Before You Pay a Deposit. #property-check-cta | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /due-diligence | X | middle | Choose the Depth of Your Check. #pricing | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /platform | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /platform | R1 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 851.3 (required container 40 or a column/card edge) |
| /platform | R1 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 1072.3 (required container 40 or a column/card edge) |
| /platform | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /platform | R2 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /platform | R2 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /platform | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /platform | R3 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 15px sans w500 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /platform | R3 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 12px mono w600 uppercase (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /platform | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /platform | R4 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /platform | R4 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /platform | R5 | last | footer | n/a | rule applies to sections only; see last-section |
| /platform | R5 | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | 7 (required padding-top 112) |
| /platform | R5 | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | 7 (required padding-top 112) |
| /platform | R6 | last | footer | CAUGHT | 1200 (required max 720) |
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
| /platform | X | last-section | Invest in Bali's Property Intelligence. #express-interest | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /platform | X | middle | An Unmatched Advantage in Every Negotiation #portfolio-monitoring | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /regulations | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /regulations | R1 | last-section | Primary legal and government sources #sources | CAUGHT | 53 (required container 40 or a column/card edge) |
| /regulations | R1 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 172.5 (required container 40 or a column/card edge) |
| /regulations | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /regulations | R2 | last-section | Primary legal and government sources #sources | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /regulations | R2 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /regulations | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /regulations | R3 | last-section | Primary legal and government sources #sources | CAUGHT | 15px sans w700 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /regulations | R3 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 17px sans w500 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /regulations | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /regulations | R4 | last-section | Primary legal and government sources #sources | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /regulations | R4 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 24 (required heading -> text 16) |
| /regulations | R5 | last | footer | n/a | rule applies to sections only; see last-section |
| /regulations | R5 | last-section | Primary legal and government sources #sources | CAUGHT | 7 (required padding-top 112) |
| /regulations | R5 | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | 7 (required padding-top 0 (same background as the previous screen)) |
| /regulations | R6 | last | footer | CAUGHT | 1200 (required max 720) |
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
| /regulations | X | last-section | Primary legal and government sources #sources | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /regulations | X | middle | NIB, OSS and the current villa KBLI #nib-kbli | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /styleguide | R1 | last | footer | CAUGHT | 53 (required container 40 or a column/card edge) |
| /styleguide | R1 | last-section | What a property compliance audit checks #audit | CAUGHT | 242.3 (required container 40 or a column/card edge) |
| /styleguide | R1 | middle | Start where you are | CAUGHT | 53 (required container 40 or a column/card edge) |
| /styleguide | R2 | last | footer | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /styleguide | R2 | last-section | What a property compliance audit checks #audit | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /styleguide | R2 | middle | Start where you are | CAUGHT | h1 outside the first screen (required page-title on the first screen only) |
| /styleguide | R3 | last | footer | CAUGHT | 13px sans w400 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /styleguide | R3 | last-section | What a property compliance audit checks #audit | CAUGHT | 17px sans w500 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /styleguide | R3 | middle | Start where you are | CAUGHT | 15px sans w500 none (required page-title 48px sans w500 none / section-title 40px sans w500 none / card-title 24px sans w500 none / text 17px sans w400 none / small 15px sans w400 none / label 12px mono w500 uppercase / metric 72px sans w300 none) |
| /styleguide | R4 | last | footer | CAUGHT | 0 (required paragraph -> paragraph 16) |
| /styleguide | R4 | last-section | What a property compliance audit checks #audit | CAUGHT | 24 (required heading -> text 16) |
| /styleguide | R4 | middle | Start where you are | CAUGHT | 12 (required heading -> text 16) |
| /styleguide | R5 | last | footer | n/a | rule applies to sections only; see last-section |
| /styleguide | R5 | last-section | What a property compliance audit checks #audit | CAUGHT | 7 (required padding-top 112) |
| /styleguide | R5 | middle | Start where you are | CAUGHT | 7 (required padding-top 112) |
| /styleguide | R6 | last | footer | CAUGHT | 1200 (required max 720) |
| /styleguide | R6 | last-section | What a property compliance audit checks #audit | CAUGHT | 900 (required max 720) |
| /styleguide | R6 | middle | Start where you are | CAUGHT | 900 (required max 720) |
| /styleguide | R7 | last | footer | CAUGHT | 2 columns (required 3 columns) |
| /styleguide | R7 | last-section | What a property compliance audit checks #audit | CAUGHT | 2 columns (required 3 columns) |
| /styleguide | R7 | middle | Start where you are | CAUGHT | 2 columns (required 3 columns) |
| /styleguide | R8 | last | footer | CAUGHT | 40 (required height 52) |
| /styleguide | R8 | last-section | What a property compliance audit checks #audit | CAUGHT | 40 (required height 52) |
| /styleguide | R8 | middle | Start where you are | CAUGHT | 40 (required height 52) |
| /styleguide | R9 | last | footer | CAUGHT | disc (required list-style none (markers come from List)) |
| /styleguide | R9 | last-section | What a property compliance audit checks #audit | CAUGHT | disc (required list-style none (markers come from List)) |
| /styleguide | R9 | middle | Start where you are | CAUGHT | disc (required list-style none (markers come from List)) |
| /styleguide | X | last | footer | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /styleguide | X | last-section | What a property compliance audit checks #audit | CAUGHT | scrollWidth 3040 (required no horizontal scroll (viewport 1280)) |
| /styleguide | X | middle | Start where you are | NOT CAUGHT | NOT CAUGHT |

Caught 144 of 145; not applicable 5; NOT CAUGHT 1.
