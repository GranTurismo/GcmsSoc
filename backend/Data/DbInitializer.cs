using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using GcmsSoc.API.Models;

namespace GcmsSoc.API.Data
{
    public static class DbInitializer
    {
        private static string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        public static void Initialize(AppDbContext context)
        {
            // Create database if not exists
            context.Database.EnsureCreated();

            // Run manual migrations / schema updates to ensure compatibility
            try
            {
                // 1. Ensure ChatMessages has CreatedAt column
                context.Database.ExecuteSqlRaw(@"
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[ChatMessages]') AND name = 'CreatedAt')
                    BEGIN
                        ALTER TABLE [dbo].[ChatMessages] ADD [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE();
                    END
                ");

                // 2. Ensure Users has PasswordHash column
                context.Database.ExecuteSqlRaw(@"
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Users]') AND name = 'PasswordHash')
                    BEGIN
                        ALTER TABLE [dbo].[Users] ADD [PasswordHash] NVARCHAR(MAX) NOT NULL DEFAULT '';
                    END
                ");

                // 3. Ensure PrivateMessages table exists
                context.Database.ExecuteSqlRaw(@"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PrivateMessages')
                    BEGIN
                        CREATE TABLE [dbo].[PrivateMessages] (
                            [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
                            [SenderId] NVARCHAR(MAX) NOT NULL,
                            [SenderUsername] NVARCHAR(MAX) NOT NULL,
                            [SenderAvatar] NVARCHAR(MAX) NOT NULL,
                            [RecipientId] NVARCHAR(MAX) NOT NULL,
                            [RecipientUsername] NVARCHAR(MAX) NOT NULL,
                            [Text] NVARCHAR(MAX) NOT NULL,
                            [Date] NVARCHAR(MAX) NOT NULL,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                            [IsRead] BIT NOT NULL DEFAULT 0
                        );
                    END
                ");
            }
            catch (Exception ex)
            {
                // Log and continue, EnsureCreated or subsequent EF Core logic might throw a more specific exception if DB isn't ready
                Console.WriteLine("Warning: Database schema update failed. " + ex.Message);
            }

            // 1. Seed Users (Only if empty)
            if (!context.Users.Any())
            {
                var users = new List<User>
                {
                    new User
                    {
                        Id = "1",
                        Username = "admin",
                        PasswordHash = HashPassword("admin"),
                        Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                        Status = "GcmsSoc-ის წამყვანი დეველოპერი 🚀",
                        Coins = 1337,
                        Rating = 999,
                        Sex = "Male",
                        Age = 26,
                        City = "თბილისი",
                        RegDate = "2026-01-01",
                        Role = "admin",
                        IsOnline = true,
                        CurrentAction = "საიტის სკრიპტების ოპტიმიზაცია",
                        Bio = "პორტალის მთავარი ადმინისტრატორი და შემქმნელი. ვებ-ტექნოლოგიები ჩემი სტიქიაა."
                    },
                    new User
                    {
                        Id = "2",
                        Username = "angel_girl",
                        PasswordHash = HashPassword("angel_girl"),
                        Avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                        Status = "ვეძებ პროგრამისტ მეგობრებს... 💕",
                        Coins = 450,
                        Rating = 124,
                        Sex = "Female",
                        Age = 21,
                        City = "ბათუმი",
                        RegDate = "2026-03-12",
                        Role = "user",
                        IsOnline = true,
                        CurrentAction = "ფორუმის თემების კითხვა",
                        Bio = "მიყვარს თანამედროვე ვებ დიზაინი, კატები და პოპ-მუსიკა."
                    },
                    new User
                    {
                        Id = "3",
                        Username = "wap_master",
                        PasswordHash = HashPassword("wap_master"),
                        Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                        Status = "მობილური ვებ პორტალები არასდროს მოკვდება! 📱",
                        Coins = 980,
                        Rating = 231,
                        Sex = "Male",
                        Age = 30,
                        City = "ქუთაისი",
                        RegDate = "2026-02-15",
                        Role = "moderator",
                        IsOnline = false,
                        CurrentAction = "ხაზგარეშე",
                        Bio = "ვმუშაობ ჩატებისა და ფორუმების მოდერაციაზე. Retro layout ენთუზიასტი."
                    },
                    new User
                    {
                        Id = "4",
                        Username = "flirt_boy",
                        PasswordHash = HashPassword("flirt_boy"),
                        Avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                        Status = "მომწერეთ პირად წერილებში! 😉",
                        Coins = 75,
                        Rating = 45,
                        Sex = "Male",
                        Age = 19,
                        City = "რუსთავი",
                        RegDate = "2026-05-20",
                        Role = "user",
                        IsOnline = true,
                        CurrentAction = "აქტიურ ჩეთში მიმოწერა",
                        Bio = "აქ ვარ გასართობად, საინტერესო ადამიანების გასაცნობად და საუბრისთვის."
                    }
                };
                context.Users.AddRange(users);
                context.SaveChanges();
            }

            // 2. Seed News (Only if empty)
            if (!context.News.Any())
            {
                var newsItems = new List<NewsItem>
                {
                    new NewsItem
                    {
                        Id = "n1",
                        Title = "GcmsSoc v1.0.0 ალფა ვერსია გამოვიდა!",
                        Content = "კეთილი იყოს თქვენი მობრძანება GcmsSoc-ზე - ლეგენდარული DCMS Social ქსელის სრულიად განახლებულ, თანამედროვე ვებ ვერსიაზე! პროექტი აწყობილია React-ზე და მუშაობს უსწრაფესად. ხელმისაწვდომია ფორუმი, აქტიური ჩეთები, ფაილების გაცვლის ზონა, დღიურები და ფოტოალბომები. გაიარეთ რეგისტრაცია და შემოგვიერთდით!",
                        Author = "admin",
                        Date = "2026-06-09 18:00",
                        Views = 312,
                        Comments = new List<NewsComment>
                        {
                            new NewsComment { Id = "c1", Username = "wap_master", Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", Text = "ძალიან მაგარია! დიზაინი და სუპერ ანიმაციები უმაღლეს დონეზეა გაკეთებული.", Date = "2026-06-09 18:30" },
                            new NewsComment { Id = "c2", Username = "angel_girl", Avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", Text = "ვაუ, გვერდები იტვირთება მყისიერად, ყოველგვარი გადატვირთვის გარეშე! ულამაზესია.", Date = "2026-06-09 19:15" }
                        }
                    },
                    new NewsItem
                    {
                        Id = "n2",
                        Title = "სერვერის ოპტიმიზაცია დასრულდა",
                        Content = "ჩავატარეთ მონაცემთა ბაზის სრული მოდერნიზაცია. მომხმარებლების შეტყობინებები, ოქროს მონეტები და ატვირთული ფაილები სრულად შენარჩუნებულია. მადლობა რომ იყენებთ ჩვენს პორტალს!",
                        Author = "admin",
                        Date = "2026-06-10 10:15",
                        Views = 145
                    }
                };
                context.News.AddRange(newsItems);
                context.SaveChanges();
            }

            // 3. Seed Forums (Only if empty)
            if (!context.ForumCategories.Any())
            {
                var forumCategories = new List<ForumCategory>
                {
                    new ForumCategory
                    {
                        Id = "f_cat1",
                        Title = "საერთო განყოფილება",
                        Description = "ზოგადი საუბრები ცხოვრებაზე, გართობაზე, თამაშებსა და სხვა საინტერესო თემებზე.",
                        Topics = new List<ForumTopic>
                        {
                            new ForumTopic
                            {
                                Id = "t1",
                                Title = "მოდით გავეცნოთ ერთმანეთს!",
                                Author = "admin",
                                Date = "2026-06-05",
                                Views = 421,
                                Posts = new List<ForumPost>
                                {
                                    new ForumPost { Id = "p1_1", Username = "admin", Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", Text = "მოგესალმებით ყველას! დაწერეთ თქვენი სახელი, ასაკი, ქალაქი და ჰობი. შევქმნათ მეგობრული ქართული საზოგადოება!", Date = "2026-06-05 12:00", Likes = new List<ForumPostLike> { new ForumPostLike { Id = "l1_1", Username = "angel_girl" }, new ForumPostLike { Id = "l1_2", Username = "wap_master" } } },
                                    new ForumPost { Id = "p1_2", Username = "wap_master", Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", Text = "მე ალექსი ვარ, 30 წლის, ქუთაისიდან. ვმუშაობ მობილურ ვებ-დეველოპმენტზე. სასიამოვნოა თქვენი გაცნობა!", Date = "2026-06-05 12:45", Likes = new List<ForumPostLike> { new ForumPostLike { Id = "l1_3", Username = "admin" } } },
                                    new ForumPost { Id = "p1_3", Username = "angel_girl", Avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", Text = "გამარჯობა! მე ქეთი ვარ, 21 წლის, ბათუმიდან. მიხარია აქ ყოფნა! 😍", Date = "2026-06-05 13:10", Likes = new List<ForumPostLike> { new ForumPostLike { Id = "l1_4", Username = "wap_master" }, new ForumPostLike { Id = "l1_5", Username = "flirt_boy" } } }
                                }
                            },
                            new ForumTopic
                            {
                                Id = "t2",
                                Title = "თქვენი საყვარელი ძველი მობილური თამაშები",
                                Author = "wap_master",
                                Date = "2026-06-08",
                                Views = 184,
                                Posts = new List<ForumPost>
                                {
                                    new ForumPost { Id = "p2_1", Username = "wap_master", Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", Text = "ვის ახსოვს ძველი ტექსტური RPG თამაშები? გალაქტიკა, მესამე სამყარო ან ვირტუალური ფერმები? მოდით ვიმსჯელოთ!", Date = "2026-06-08 14:00" },
                                    new ForumPost { Id = "p2_2", Username = "admin", Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", Text = "ოოჰ, გალაქტიკა ნამდვილი ლეგენდა იყო. მთელ ჩემს ტელეფონის ბალანსს სმს-ებში ვხარჯავდი!", Date = "2026-06-08 15:30", Likes = new List<ForumPostLike> { new ForumPostLike { Id = "l2_1", Username = "wap_master" } } }
                                }
                            }
                        }
                    },
                    new ForumCategory
                    {
                        Id = "f_cat2",
                        Title = "ტექნოლოგიები და პროგრამირება",
                        Description = "კითხვები React-ის, Tailwind-ის, Node.js-ისა და ვებ-ტექნოლოგიების გარშემო.",
                        Topics = new List<ForumTopic>
                        {
                            new ForumTopic
                            {
                                Id = "t3",
                                Title = "რატომ არის React საუკეთესო არჩევანი თანამედროვე ვებისთვის",
                                Author = "admin",
                                Date = "2026-06-09",
                                Views = 108,
                                Posts = new List<ForumPost>
                                {
                                    new ForumPost { Id = "p3_1", Username = "admin", Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", Text = "React-ის კომპონენტების ლოკალური რენდერინგი მნიშვნელოვნად ამცირებს ქსელის დატვირთვას. Tailwind CSS-თან ერთად კი შესაძლებელია უსწრაფესი და ულამაზესი თხევადი ანიმაციების შექმნა.", Date = "2026-06-09 20:00" }
                                }
                            }
                        }
                    }
                };
                context.ForumCategories.AddRange(forumCategories);
                context.SaveChanges();
            }

            // 4. Seed Chat Rooms (Only if empty)
            if (!context.ChatRooms.Any())
            {
                var chatRooms = new List<ChatRoom>
                {
                    new ChatRoom
                    {
                        Id = "ch_r1",
                        Title = "მთავარი ოთახი",
                        Description = "ისაუბრეთ ნებისმიერ თემაზე. დაიცავით ცენზურა!",
                        Messages = new List<ChatMessage>
                        {
                            new ChatMessage { Id = "cm1_1", Username = "admin", Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", Text = "კეთილი იყოს თქვენი მობრძანება მთავარ სასაუბრო ოთახში!", Date = "21:00:00", CreatedAt = DateTime.UtcNow.AddMinutes(-15) },
                            new ChatMessage { Id = "cm1_2", Username = "wap_master", Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", Text = "გამარჯობა! არის ვინმე ონლაინში?", Date = "21:01:05", CreatedAt = DateTime.UtcNow.AddMinutes(-10) },
                            new ChatMessage { Id = "cm1_3", Username = "flirt_boy", Avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", Text = "კი, აქ ვარ! მუსიკას ვუსმენ და ვერთობი.", Date = "21:02:11", CreatedAt = DateTime.UtcNow.AddMinutes(-5) }
                        }
                    },
                    new ChatRoom
                    {
                        Id = "ch_r2",
                        Title = "გაცნობისა და ფლირტის ზონა",
                        Description = "გაიცანით გოგოები და ბიჭები. სიყვარული ჰაერშია!",
                        Messages = new List<ChatMessage>
                        {
                            new ChatMessage { Id = "cm2_1", Username = "flirt_boy", Avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", Text = "გამარჯობა გოგოებო, დამამატეთ მეგობრებში! 😉", Date = "21:00:30", CreatedAt = DateTime.UtcNow.AddMinutes(-10) }
                        }
                    },
                    new ChatRoom
                    {
                        Id = "ch_r3",
                        Title = "დეველოპერების კუთხე",
                        Description = "კოდის, სერვერებისა და ახალი დიზაინების განხილვა.",
                        Messages = new List<ChatMessage>
                        {
                            new ChatMessage { Id = "cm3_1", Username = "admin", Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", Text = "როგორ მოგწონთ ახალი თხევადი ანიმაციები საიტზე? შეაფასეთ Tailwind-ის სტილი.", Date = "21:00:00", CreatedAt = DateTime.UtcNow.AddMinutes(-10) }
                        }
                    }
                };
                context.ChatRooms.AddRange(chatRooms);
                context.SaveChanges();
            }

            // 5. Seed Guestbook (Only if empty)
            if (!context.ChatMessages.Any(m => m.ChatRoomId == null))
            {
                var guestMessages = new List<ChatMessage>
                {
                    new ChatMessage { Id = "g1", Username = "სტუმარი_12", Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", Text = "გამარჯობა! შემთხვევით აღმოვაჩინე ეს საიტი. ძველი მოგონებები აღმიძრა, ძალიან მაგარია!", Date = "2026-06-10 12:00", CreatedAt = DateTime.UtcNow.AddMinutes(-30) },
                    new ChatMessage { Id = "g2", Username = "angel_girl", Avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", Text = "ჩემი კვალიც დავტოვე სტუმრების წიგნში! საუკეთესო სურვილები ადმინს!", Date = "2026-06-10 13:45", CreatedAt = DateTime.UtcNow.AddMinutes(-15) }
                };
                context.ChatMessages.AddRange(guestMessages);
                context.SaveChanges();
            }

            // 6. Seed Files (Only if empty)
            if (!context.Files.Any())
            {
                var filesList = new List<FileItem>
                {
                    new FileItem
                    {
                        Id = "f1",
                        Name = "Nostalgic_Ringtone_Bass.mp3",
                        Category = "Music",
                        Size = "1.24 MB",
                        Description = "Nokia-ს კლასიკური მელოდია თანამედროვე ბასებით. დააყენეთ ზარზე!",
                        Author = "wap_master",
                        Date = "2026-06-09",
                        Downloads = 124,
                        Likes = 12,
                        Screenshot = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
                        Comments = new List<FileComment>
                        {
                            new FileComment { Id = "fc1", Username = "flirt_boy", Avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", Text = "ტელეფონზე დავაყენე, ძალიან მაგრად ჟღერს!", Date = "2026-06-09 22:10" }
                        }
                    },
                    new FileItem
                    {
                        Id = "f2",
                        Name = "Cyberpunk_Wallpaper_Violet.jpg",
                        Category = "Wallpapers",
                        Size = "480 KB",
                        Description = "კიბერპანკ სტილის იისფერი და ნეონის ფონი თქვენი ტელეფონისთვის.",
                        Author = "admin",
                        Date = "2026-06-08",
                        Downloads = 87,
                        Likes = 9,
                        Screenshot = "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=300"
                    },
                    new FileItem
                    {
                        Id = "f3",
                        Name = "Retro_Galaxy_Remastered.apk",
                        Category = "Games",
                        Size = "14.2 MB",
                        Description = "Android-ის რემასტერი ძველი ტექსტური კოსმოსური თამაშისა. ჩამონტაჟებული ჩეთითა და კოსმოსური ბრძოლებით.",
                        Author = "admin",
                        Date = "2026-06-07",
                        Downloads = 254,
                        Likes = 42,
                        Screenshot = "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=300",
                        Comments = new List<FileComment>
                        {
                            new FileComment { Id = "fc2", Username = "wap_master", Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", Text = "მადლობა ადმინს ამ თამაშის ატვირთვისთვის, ბავშვობა გამახსენდა.", Date = "2026-06-07 19:30" }
                        }
                    }
                };
                context.Files.AddRange(filesList);
                context.SaveChanges();
            }

            // 7. Seed Diaries (Only if empty)
            if (!context.Diaries.Any())
            {
                var diaries = new List<Diary>
                {
                    new Diary
                    {
                        Id = "d1",
                        Title = "ჩემი ფიქრები ძველი მობილური ინტერნეტის შესახებ",
                        Content = "ადრე საიტები მარტივი იყო - ტექსტი, ლინკები და გამყოფები. თუმცა, ურთიერთობა და მეგობრობა ბევრად უფრო თბილი იყო. არ იყო ზედმეტი სარეკლამო ბანერები. დღეს ვცდილობთ დავაბრუნოთ ის სიმყუდროვე, ოღონდ თანამედროვე ვებ-დიზაინითა და ფლუიდური ანიმაციებით.",
                        Author = "wap_master",
                        Date = "2026-06-09 11:30",
                        Comments = new List<DiaryComment>
                        {
                            new DiaryComment { Id = "dc1", Username = "admin", Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", Text = "ზუსტად! ძველი შეზღუდვები უფრო კრეატიულს ხდიდა საზოგადოებას.", Date = "2026-06-09 13:00" }
                        }
                    },
                    new Diary
                    {
                        Id = "d2",
                        Title = "საიტის React-ზე და Tailwind-ზე გადაყვანა",
                        Content = "დღეს მთლიანად შევცვალეთ პორტალის სტრუქტურა. ძველი WAP სტილი ჩავანაცვლეთ თანამედროვე, სუპერ ანიმირებული Tailwind დიზაინით. საიტი სრულად ითარგმნა ქართულად. დაწერეთ თქვენი აზრი კომენტარებში!",
                        Author = "admin",
                        Date = "2026-06-10 09:00"
                    }
                };
                context.Diaries.AddRange(diaries);
                context.SaveChanges();
            }

            // 8. Seed Photos (Only if empty)
            if (!context.Photos.Any())
            {
                var photos = new List<PhotoItem>
                {
                    new PhotoItem
                    {
                        Id = "p_ph1",
                        Url = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",
                        Caption = "საღამოს მზის ჩასვლა მთებში. საოცარი ხედია!",
                        Author = "admin",
                        Date = "2026-06-08",
                        Likes = new List<PhotoLike> { new PhotoLike { Id = "pl1", Username = "angel_girl" }, new PhotoLike { Id = "pl2", Username = "flirt_boy" } },
                        Comments = new List<PhotoComment>
                        {
                            new PhotoComment { Id = "phc1", Username = "angel_girl", Avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", Text = "ულამაზესი ფოტოა, ბუნება საოცრებაა!", Date = "2026-06-08 19:00" }
                        }
                    },
                    new PhotoItem
                    {
                        Id = "p_ph2",
                        Url = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600",
                        Caption = "ყავა დილის დეველოპერული კოდირების დროს ☕",
                        Author = "wap_master",
                        Date = "2026-06-09",
                        Likes = new List<PhotoLike> { new PhotoLike { Id = "pl3", Username = "admin" } }
                    }
                };
                context.Photos.AddRange(photos);
                context.SaveChanges();
            }

            // 9. Seed Library (Only if empty)
            if (!context.Library.Any())
            {
                var libraryArticles = new List<LibraryArticle>
                {
                    new LibraryArticle
                    {
                        Id = "la1",
                        Category = "სახელმძღვანელოები",
                        Title = "Tailwind CSS ანიმაციების ხელოვნება",
                        Content = "Tailwind CSS საშუალებას გვაძლევს შევქმნათ თხევადი და მცურავი ეფექტები მარტივად. custom keyframes-ის საშუალებით შეგვიძლია მივიღოთ ულამაზესი ეფექტები, როგორიცაა float ან gradient-pulse.\n\nმაგალითად, animate-float კლასი ამატებს რბილ მოძრაობას, რაც ელემენტებს უფრო ცოცხალს ხდის.",
                        Author = "admin",
                        Date = "2026-06-08",
                        Views = 45
                    },
                    new LibraryArticle
                    {
                        Id = "la2",
                        Category = "ისტორიები",
                        Title = "მობილური ინტერნეტის ეპოქა საქართველოში",
                        Content = "ისტორიული მიმოხილვა იმაზე, თუ როგორ დაიწყო საქართველოში ადრეული WAP ინტერნეტი 2000-იან წლებში. ზარის მელოდიების ჩამოტვირთვა, ფორუმებზე შეკრება და მობილური საზოგადოებების შექმნა, რომლებმაც საფუძველი ჩაუყარეს დღევანდელ ქართულ ვებ სივრცეს.",
                        Author = "wap_master",
                        Date = "2026-06-07",
                        Views = 89
                    }
                };
                context.Library.AddRange(libraryArticles);
                context.SaveChanges();
            }
        }
    }
}
