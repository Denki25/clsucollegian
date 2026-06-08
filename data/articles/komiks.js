// Komiks article guide:
// 1. Duplicate the sample object below.
// 2. Remove the // comment markers.
// 3. Replace the sample values with your real article details.
// 4. Keep each slug unique.
// 5. Save images inside PHOTOS/KOMIKS/ and update the image path.
// 6. For animated/video komiks, use literaryMedia.card and literaryMedia.article with a video embed URL.
// 7. Use credits.labelPreset: "via", "written", or "filipino" depending on the needed byline style.
// 8. Optional credit fields: by, illustratedBy, animationBy, photosBy, layoutBy.

window.CLSU_ARTICLES = (window.CLSU_ARTICLES || []).concat([
    {
         slug: "everything-everywhere-all-absent-at-once",
         category: "Komiks",
         title: "Everything, Everywhere, All Absent at Once",
         summary: "Kung may summary and conclusion man ang buhay ng mga 4th year ngayong linggo, ito na ang final draft.",
         author: "ROXZYLEEN ANDREIH VASQUEZ",
         authorLine: "By ROXZYLEEN ANDREIH VASQUEZ/CLSU Collegian",
         credits: {
            illustratedBy: "ROXZYLEEN ANDREIH VASQUEZ/CLSU Collegian",
        },
         date: "2026-06-03",
         readTime: "1 min read",
         image: "PHOTOS/KOMIKS/komiks3.jpg",
         imageAlt: "everything everywhere all absent at once",
        body: `
             <p>
                Tapos na ang bakasyon kaya kailangan na pumasok sa eskwela. Siyempre, hindi mawawala ang attendance check! Pero teka lang, woopsies...parang may kulang... nasa trese?? All of them all at once? Iba pala talaga kapag majority ay solid. Sana pang ay may excuse letter.<br><br>
                Paalala: Ang pagliban ng klase nang walang totoong dahilan ay hindi makabubuti sa iyo, pati na sa mga taong apektado ng iyong pagliban.
             </p>
            
         `
     },

    {
        slug: "Strata",
        category: "Komiks",
        title: "STRATA",
        summary: "Matapos ang maghapong tensyon sa Senado kaugnay ng pagbabago ng liderato at usapin ng ICC arrest warrant, tila ibang “hearing” ang pinasok ni Sen. Bato—cardio hearing.",
        author: "Kreynium",
        authorLine: "Kreynium/CLSU Collegian",
        credits: {
            illustratedBy: "Kreynium/CLSU Collegian",
            labels:{
                illustratedBy: "Animasyon ni:"
            }
        },
        date: "2026-05-11",
        readTime: "1 min read",
        literaryMedia: {
            card: {
                type: "video",
                embedUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fweb.facebook.com%2Freel%2F808164168784448%2F&show_text=false&width=380&t=0"
            },
            article: {
                type: "video",
                embedUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fweb.facebook.com%2Freel%2F808164168784448%2F&show_text=false&width=380&t=0"
            }
        },
        imageAlt: "STRATA feature artwork",
        body: `
            <p>
            Matapos ang maghapong tensyon sa Senado kaugnay ng pagbabago ng liderato at usapin ng ICC arrest warrant, tila ibang “hearing” ang pinasok ni Sen. Bato—cardio hearing.<br><br>
            Namataang tila naka-STRAVA mode umano ang senador sa kaliwa’t kanang pasilyo ng Senado, forda takbo hanggang session hall edition.<br><br>
            After ilang buwan na tila “AWOL with pay,” dumating na galit na galit, mukhang gustong manaket… pero steps counter lang pala ang hinahabol.<br><br>
            At mukhang booked and busy na rin sila ni Tatay D—The Hague world tour soon? Dream come true yata kay Bato matapos ang 14 buwang pagbanggit sa ICC.<br><br>
            </p>
        `
    }, 

    {
         slug: "dasurb-dasurb",
         category: "Komiks",
         title: "DASURB? DASURB",
         summary: "Kung may summary and conclusion man ang buhay ng mga 4th year ngayong linggo, ito na ang final draft.",
         author: "IAN CABUDOL",
         authorLine: "By IAN CABUDOL/CLSU Collegian",
         credits: {
            illustratedBy: "IAN CABUDOL/CLSU Collegian",
            labels: {
                illustratedBy: "Animasyon ni:"
            }
        },
         date: "2026-04-12",
         readTime: "1 min read",
         image: "PHOTOS/KOMIKS/komiks1.jpg",
         imageAlt: "Short description of the komiks image",
        body: `
             <p>
                Kung may summary and conclusion man ang buhay ng mga 4th year ngayong linggo, ito na ang final draft.<br><br>
                Matapos ang walang katapusang puyat at halos ginawa nang dugo ang kape para lang maitawid ang manuscript, dasurb natin ng pahingang guilt-free...<br><br>
                Padayon!
             </p>
            
         `
     },
     {
         slug: "hindi-natin-laging-hawak-ang-beat",
         category: "Komiks",
         title: "Hindi natin laging hawak ang beat ",
         summary: "Kung may summary and conclusion man ang buhay ng mga 4th year ngayong linggo, ito na ang final draft.",
         author: " ROXZYLEEN ANDREIH VASQUEZ",
         authorLine: "By  ROXZYLEEN ANDREIH VASQUEZ/CLSU Collegian",
         credits: {
            illustratedBy: "ROXZYLEEN ANDREIH VASQUEZ/CLSU Collegian",
            labels: {
                illustratedBy: "Animasyon ni:"
            }
        },
         date: "2026-03-30",
         readTime: "1 min read",
         image: "PHOTOS/KOMIKS/komiks2.jpg",
         imageAlt: "hindi natin laging hawak ang beat",
        body: `
             <p>
                May mga bagay na wala sa ating kamay ang beat, katulad ng heat index. Minsan, kahit anong gawin ay tila tagos pa rin sa balat ang init! Gaya sa init, halos wala ding magawa ang mga ordinaryong mamamayan sa nagbabagang pagtaas ng presyo ng gasolina.<br><br>
                Sa bawat patak ng pawis ay siyang buntong-hininga ng mga tsuper, na sana ang pawis ay maaring ipang-gasolina. <br><br>
                Patuloy ang laban sa buhay ng mga komyuter o tsuper. Pero hanggang kailan kaya natin ito matitiis?<br><br>
             </p>
            
         `
     }
]);
