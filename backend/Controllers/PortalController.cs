using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using GcmsSoc.API.Data;
using GcmsSoc.API.Models;
using GcmsSoc.API.Hubs;

namespace GcmsSoc.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PortalController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public PortalController(AppDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        private async Task<User?> GetAuthenticatedUserAsync()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username)) return null;
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public class CommentRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Avatar { get; set; } = string.Empty;
            public string Text { get; set; } = string.Empty;
        }

        public class TopicRequest
        {
            public string Title { get; set; } = string.Empty;
            public string Username { get; set; } = string.Empty;
            public string Avatar { get; set; } = string.Empty;
            public string Text { get; set; } = string.Empty;
        }

        public class PostRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Avatar { get; set; } = string.Empty;
            public string Text { get; set; } = string.Empty;
        }

        public class LikeRequest { public string Username { get; set; } = string.Empty; }

        public class FileUploadRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Category { get; set; } = string.Empty;
            public string Size { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Author { get; set; } = string.Empty;
            public string? Screenshot { get; set; }
        }

        public class DiaryRequest
        {
            public string Title { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
            public string Author { get; set; } = string.Empty;
        }

        public class PhotoRequest
        {
            public string Url { get; set; } = string.Empty;
            public string Caption { get; set; } = string.Empty;
            public string Author { get; set; } = string.Empty;
        }

        [HttpGet("news")]
        public async Task<IActionResult> GetNews()
        {
            var news = await _context.News
                .Include(n => n.Comments)
                .OrderByDescending(n => n.Date)
                .ToListAsync();
            return Ok(news);
        }

        [HttpPost("news/{id}/comment")]
        [Authorize]
        public async Task<IActionResult> AddNewsComment(string id, [FromBody] CommentRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var newsItem = await _context.News.FindAsync(id);
            if (newsItem == null) return NotFound();

            var newComment = new NewsComment
            {
                Id = Guid.NewGuid().ToString(),
                NewsItemId = id,
                Username = user.Username,
                Avatar = user.Avatar,
                Text = request.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
            };

            _context.NewsComments.Add(newComment);
            await _context.SaveChangesAsync();
            return Ok(newComment);
        }

        [HttpPost("news/{id}/views")]
        public async Task<IActionResult> IncrementNewsViews(string id)
        {
            var newsItem = await _context.News.FindAsync(id);
            if (newsItem == null) return NotFound();

            newsItem.Views++;
            await _context.SaveChangesAsync();
            return Ok(newsItem);
        }

        [HttpGet("forum")]
        public async Task<IActionResult> GetForum()
        {
            var categories = await _context.ForumCategories
                .Include(c => c.Topics)
                    .ThenInclude(t => t.Posts)
                        .ThenInclude(p => p.Likes)
                .ToListAsync();
            return Ok(categories);
        }

        [HttpPost("forum/{catId}/topic")]
        [Authorize]
        public async Task<IActionResult> AddForumTopic(string catId, [FromBody] TopicRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var category = await _context.ForumCategories.FindAsync(catId);
            if (category == null) return NotFound();

            var topicId = Guid.NewGuid().ToString();
            var newTopic = new ForumTopic
            {
                Id = topicId,
                ForumCategoryId = catId,
                Title = request.Title,
                Author = user.Username,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Views = 0,
                Posts = new List<ForumPost>
                {
                    new ForumPost
                    {
                        Id = Guid.NewGuid().ToString(),
                        ForumTopicId = topicId,
                        Username = user.Username,
                        Avatar = user.Avatar,
                        Text = request.Text,
                        Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
                    }
                }
            };

            _context.ForumTopics.Add(newTopic);
            user.Coins += 10;
            user.Rating += 1;
            await _context.SaveChangesAsync();
            return Ok(newTopic);
        }

        [HttpPost("forum/{catId}/topic/{topicId}/post")]
        [Authorize]
        public async Task<IActionResult> AddForumPost(string catId, string topicId, [FromBody] PostRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var topic = await _context.ForumTopics.FindAsync(topicId);
            if (topic == null) return NotFound();

            var newPost = new ForumPost
            {
                Id = Guid.NewGuid().ToString(),
                ForumTopicId = topicId,
                Username = user.Username,
                Avatar = user.Avatar,
                Text = request.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
            };

            _context.ForumPosts.Add(newPost);
            user.Coins += 3;
            await _context.SaveChangesAsync();
            return Ok(newPost);
        }

        [HttpPost("forum/{catId}/topic/{topicId}/post/{postId}/like")]
        [Authorize]
        public async Task<IActionResult> LikeForumPost(string catId, string topicId, string postId, [FromBody] LikeRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var post = await _context.ForumPosts
                .Include(p => p.Likes)
                .FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null) return NotFound();

            var existingLike = post.Likes.FirstOrDefault(l => l.Username == user.Username);
            if (existingLike != null)
            {
                _context.ForumPostLikes.Remove(existingLike);
            }
            else
            {
                var newLike = new ForumPostLike
                {
                    Id = Guid.NewGuid().ToString(),
                    ForumPostId = postId,
                    Username = user.Username
                };
                _context.ForumPostLikes.Add(newLike);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("forum/{catId}/topic/{topicId}/views")]
        public async Task<IActionResult> IncrementTopicViews(string catId, string topicId)
        {
            var topic = await _context.ForumTopics.FindAsync(topicId);
            if (topic == null) return NotFound();

            topic.Views++;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("chat")]
        public async Task<IActionResult> GetChatRooms()
        {
            var rooms = await _context.ChatRooms
                .Include(r => r.Messages)
                .ToListAsync();

            // Chronologically order the messages in memory
            foreach (var room in rooms)
            {
                room.Messages = room.Messages.OrderBy(m => m.CreatedAt).ToList();
            }

            return Ok(rooms);
        }

        [HttpPost("chat/{roomId}/message")]
        [Authorize]
        public async Task<IActionResult> AddChatMessage(string roomId, [FromBody] CommentRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var room = await _context.ChatRooms.FindAsync(roomId);
            if (room == null) return NotFound();

            var newMsg = new ChatMessage
            {
                Id = Guid.NewGuid().ToString(),
                ChatRoomId = roomId,
                Username = user.Username,
                Avatar = user.Avatar,
                Text = request.Text,
                Date = DateTime.UtcNow.ToString("HH:mm:ss"),
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(newMsg);
            await _context.SaveChangesAsync();

            // Broadcast the new message to all clients connected to the hub
            await _hubContext.Clients.All.SendAsync("ReceiveChatMessage", roomId, newMsg);

            return Ok(newMsg);
        }

        [HttpGet("guestbook")]
        public async Task<IActionResult> GetGuestbook()
        {
            var messages = await _context.ChatMessages
                .Where(m => m.ChatRoomId == null)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
            return Ok(messages);
        }

        [HttpPost("guestbook")]
        [Authorize]
        public async Task<IActionResult> AddGuestbookPost([FromBody] CommentRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var newMsg = new ChatMessage
            {
                Id = Guid.NewGuid().ToString(),
                ChatRoomId = null,
                Username = user.Username,
                Avatar = user.Avatar,
                Text = request.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"),
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(newMsg);
            await _context.SaveChangesAsync();

            // Broadcast the new guestbook post to all clients connected to the hub
            await _hubContext.Clients.All.SendAsync("ReceiveGuestbookPost", newMsg);

            return Ok(newMsg);
        }

        [HttpGet("files")]
        public async Task<IActionResult> GetFiles()
        {
            var files = await _context.Files
                .Include(f => f.Comments)
                .ToListAsync();
            return Ok(files);
        }

        [HttpPost("files")]
        [Authorize]
        public async Task<IActionResult> UploadFile([FromBody] FileUploadRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var newFile = new FileItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Category = request.Category,
                Size = request.Size,
                Description = request.Description,
                Author = user.Username,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Downloads = 0,
                Likes = 0,
                Screenshot = request.Screenshot
            };

            _context.Files.Add(newFile);
            user.Coins += 15;
            user.Rating += 3;
            await _context.SaveChangesAsync();
            return Ok(newFile);
        }

        [HttpPost("files/{id}/download")]
        public async Task<IActionResult> DownloadFile(string id)
        {
            var file = await _context.Files.FindAsync(id);
            if (file == null) return NotFound();

            file.Downloads++;

            var user = await GetAuthenticatedUserAsync();
            if (user != null)
            {
                user.Coins += 1;
            }

            await _context.SaveChangesAsync();
            return Ok(file);
        }

        [HttpPost("files/{id}/comment")]
        [Authorize]
        public async Task<IActionResult> AddFileComment(string id, [FromBody] CommentRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var file = await _context.Files.FindAsync(id);
            if (file == null) return NotFound();

            var newComment = new FileComment
            {
                Id = Guid.NewGuid().ToString(),
                FileItemId = id,
                Username = user.Username,
                Avatar = user.Avatar,
                Text = request.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
            };

            _context.FileComments.Add(newComment);
            await _context.SaveChangesAsync();
            return Ok(newComment);
        }

        [HttpGet("diaries")]
        public async Task<IActionResult> GetDiaries()
        {
            var diaries = await _context.Diaries
                .Include(d => d.Comments)
                .OrderByDescending(d => d.Date)
                .ToListAsync();
            return Ok(diaries);
        }

        [HttpPost("diaries")]
        [Authorize]
        public async Task<IActionResult> AddDiary([FromBody] DiaryRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var newDiary = new Diary
            {
                Id = Guid.NewGuid().ToString(),
                Title = request.Title,
                Content = request.Content,
                Author = user.Username,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
            };

            _context.Diaries.Add(newDiary);
            user.Coins += 15;
            user.Rating += 3;
            await _context.SaveChangesAsync();
            return Ok(newDiary);
        }

        [HttpPost("diaries/{id}/comment")]
        [Authorize]
        public async Task<IActionResult> AddDiaryComment(string id, [FromBody] CommentRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var diary = await _context.Diaries.FindAsync(id);
            if (diary == null) return NotFound();

            var newComment = new DiaryComment
            {
                Id = Guid.NewGuid().ToString(),
                DiaryId = id,
                Username = user.Username,
                Avatar = user.Avatar,
                Text = request.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
            };

            _context.DiaryComments.Add(newComment);
            await _context.SaveChangesAsync();
            return Ok(newComment);
        }

        [HttpGet("photos")]
        public async Task<IActionResult> GetPhotos()
        {
            var photos = await _context.Photos
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .ToListAsync();
            return Ok(photos);
        }

        [HttpPost("photos")]
        [Authorize]
        public async Task<IActionResult> AddPhoto([FromBody] PhotoRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var newPhoto = new PhotoItem
            {
                Id = Guid.NewGuid().ToString(),
                Url = request.Url,
                Caption = request.Caption,
                Author = user.Username,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            _context.Photos.Add(newPhoto);
            await _context.SaveChangesAsync();
            return Ok(newPhoto);
        }

        [HttpPost("photos/{id}/like")]
        [Authorize]
        public async Task<IActionResult> LikePhoto(string id, [FromBody] LikeRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var photo = await _context.Photos
                .Include(p => p.Likes)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (photo == null) return NotFound();

            var existingLike = photo.Likes.FirstOrDefault(l => l.Username == user.Username);
            if (existingLike != null)
            {
                _context.PhotoLikes.Remove(existingLike);
            }
            else
            {
                var newLike = new PhotoLike
                {
                    Id = Guid.NewGuid().ToString(),
                    PhotoItemId = id,
                    Username = user.Username
                };
                _context.PhotoLikes.Add(newLike);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("photos/{id}/comment")]
        [Authorize]
        public async Task<IActionResult> AddPhotoComment(string id, [FromBody] CommentRequest request)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var photo = await _context.Photos.FindAsync(id);
            if (photo == null) return NotFound();

            var newComment = new PhotoComment
            {
                Id = Guid.NewGuid().ToString(),
                PhotoItemId = id,
                Username = user.Username,
                Avatar = user.Avatar,
                Text = request.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
            };

            _context.PhotoComments.Add(newComment);
            await _context.SaveChangesAsync();
            return Ok(newComment);
        }

        [HttpGet("library")]
        public async Task<IActionResult> GetLibrary()
        {
            var articles = await _context.Library.ToListAsync();
            return Ok(articles);
        }

        [HttpPost("library/{id}/views")]
        public async Task<IActionResult> IncrementLibraryViews(string id)
        {
            var article = await _context.Library.FindAsync(id);
            if (article == null) return NotFound();

            article.Views++;
            await _context.SaveChangesAsync();
            return Ok();
        }

        public class SendMessageRequest
        {
            public string RecipientId { get; set; } = string.Empty;
            public string Text { get; set; } = string.Empty;
        }

        [HttpGet("messages")]
        [Authorize]
        public async Task<IActionResult> GetPrivateMessages()
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var messages = await _context.PrivateMessages
                .Where(m => m.SenderId == user.Id || m.RecipientId == user.Id)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }

        [HttpGet("messages/unread-count")]
        [Authorize]
        public async Task<IActionResult> GetUnreadMessagesCount()
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var count = await _context.PrivateMessages
                .CountAsync(m => m.RecipientId == user.Id && !m.IsRead);

            return Ok(count);
        }

        [HttpPost("messages")]
        [Authorize]
        public async Task<IActionResult> SendPrivateMessage([FromBody] SendMessageRequest request)
        {
            var sender = await GetAuthenticatedUserAsync();
            if (sender == null) return Unauthorized();

            var recipient = await _context.Users.FindAsync(request.RecipientId);
            if (recipient == null) return NotFound("Recipient not found");

            var newMsg = new PrivateMessage
            {
                Id = Guid.NewGuid().ToString(),
                SenderId = sender.Id,
                SenderUsername = sender.Username,
                SenderAvatar = sender.Avatar,
                RecipientId = recipient.Id,
                RecipientUsername = recipient.Username,
                Text = request.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"),
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.PrivateMessages.Add(newMsg);
            await _context.SaveChangesAsync();

            // Broadcast the new private message to all clients connected to the hub
            await _hubContext.Clients.All.SendAsync("ReceivePrivateMessage", newMsg);

            return Ok(newMsg);
        }

        [HttpPost("messages/read/{senderId}")]
        [Authorize]
        public async Task<IActionResult> MarkMessagesAsRead(string senderId)
        {
            var user = await GetAuthenticatedUserAsync();
            if (user == null) return Unauthorized();

            var unreadMsgs = await _context.PrivateMessages
                .Where(m => m.RecipientId == user.Id && m.SenderId == senderId && !m.IsRead)
                .ToListAsync();

            foreach (var m in unreadMsgs)
            {
                m.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
