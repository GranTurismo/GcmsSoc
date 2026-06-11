using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GcmsSoc.API.Data;
using GcmsSoc.API.Models;

namespace GcmsSoc.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<User?> GetAuthenticatedUserAsync()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username)) return null;
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        private async Task<bool> IsAdminAsync()
        {
            var user = await GetAuthenticatedUserAsync();
            return user != null && user.Role == "admin";
        }

        public class RoleRequest { public string Role { get; set; } = string.Empty; }
        public class CoinsRequest { public int Amount { get; set; } }
        public class RatingRequest { public int Amount { get; set; } }
        public class NewsRequest { public string Title { get; set; } = string.Empty; public string Content { get; set; } = string.Empty; }
        public class ChatRoomRequest { public string Title { get; set; } = string.Empty; public string Description { get; set; } = string.Empty; }

        // GET: api/admin/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            if (!await IsAdminAsync()) return Forbid();

            var totalUsers = await _context.Users.CountAsync();
            var totalTopics = await _context.ForumTopics.CountAsync();
            var totalPosts = await _context.ForumPosts.CountAsync();
            var totalNews = await _context.News.CountAsync();
            var totalFiles = await _context.Files.CountAsync();
            var totalDiaries = await _context.Diaries.CountAsync();
            var totalPhotos = await _context.Photos.CountAsync();

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalTopics = totalTopics,
                TotalPosts = totalPosts,
                TotalNews = totalNews,
                TotalFiles = totalFiles,
                TotalDiaries = totalDiaries,
                TotalPhotos = totalPhotos
            });
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            if (!await IsAdminAsync()) return Forbid();

            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        // POST: api/admin/users/{userId}/role
        [HttpPost("users/{userId}/role")]
        public async Task<IActionResult> UpdateUserRole(string userId, [FromBody] RoleRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            if (request.Role != "admin" && request.Role != "moderator" && request.Role != "user")
            {
                return BadRequest("Invalid role");
            }

            user.Role = request.Role;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // POST: api/admin/users/{userId}/coins
        [HttpPost("users/{userId}/coins")]
        public async Task<IActionResult> UpdateUserCoins(string userId, [FromBody] CoinsRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            user.Coins = request.Amount;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // POST: api/admin/users/{userId}/rating
        [HttpPost("users/{userId}/rating")]
        public async Task<IActionResult> UpdateUserRating(string userId, [FromBody] RatingRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            user.Rating = request.Amount;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // DELETE: api/admin/users/{userId}
        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: api/admin/news
        [HttpPost("news")]
        public async Task<IActionResult> CreateNews([FromBody] NewsRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var adminUser = await GetAuthenticatedUserAsync();
            var newNews = new NewsItem
            {
                Id = Guid.NewGuid().ToString(),
                Title = request.Title,
                Content = request.Content,
                Author = adminUser?.Username ?? "admin",
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"),
                Views = 0
            };

            _context.News.Add(newNews);
            await _context.SaveChangesAsync();
            return Ok(newNews);
        }

        // PUT: api/admin/news/{newsId}
        [HttpPut("news/{newsId}")]
        public async Task<IActionResult> UpdateNews(string newsId, [FromBody] NewsRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var news = await _context.News.FindAsync(newsId);
            if (news == null) return NotFound("News item not found");

            news.Title = request.Title;
            news.Content = request.Content;

            await _context.SaveChangesAsync();
            return Ok(news);
        }

        // DELETE: api/admin/news/{newsId}
        [HttpDelete("news/{newsId}")]
        public async Task<IActionResult> DeleteNews(string newsId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var news = await _context.News.FindAsync(newsId);
            if (news == null) return NotFound("News item not found");

            _context.News.Remove(news);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/news/comment/{commentId}
        [HttpDelete("news/comment/{commentId}")]
        public async Task<IActionResult> DeleteNewsComment(string commentId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var comment = await _context.NewsComments.FindAsync(commentId);
            if (comment == null) return NotFound("Comment not found");

            _context.NewsComments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/forum/topic/{topicId}
        [HttpDelete("forum/topic/{topicId}")]
        public async Task<IActionResult> DeleteForumTopic(string topicId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var topic = await _context.ForumTopics.FindAsync(topicId);
            if (topic == null) return NotFound("Topic not found");

            _context.ForumTopics.Remove(topic);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/forum/post/{postId}
        [HttpDelete("forum/post/{postId}")]
        public async Task<IActionResult> DeleteForumPost(string postId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var post = await _context.ForumPosts.FindAsync(postId);
            if (post == null) return NotFound("Post not found");

            _context.ForumPosts.Remove(post);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: api/admin/chat/room
        [HttpPost("chat/room")]
        public async Task<IActionResult> CreateChatRoom([FromBody] ChatRoomRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var newRoom = new ChatRoom
            {
                Id = Guid.NewGuid().ToString(),
                Title = request.Title,
                Description = request.Description
            };

            _context.ChatRooms.Add(newRoom);
            await _context.SaveChangesAsync();
            return Ok(newRoom);
        }

        // DELETE: api/admin/chat/room/{roomId}
        [HttpDelete("chat/room/{roomId}")]
        public async Task<IActionResult> DeleteChatRoom(string roomId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var room = await _context.ChatRooms.FindAsync(roomId);
            if (room == null) return NotFound("Chat room not found");

            _context.ChatRooms.Remove(room);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/chat/message/{messageId}
        [HttpDelete("chat/message/{messageId}")]
        public async Task<IActionResult> DeleteChatMessage(string messageId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var message = await _context.ChatMessages.FindAsync(messageId);
            if (message == null) return NotFound("Message not found");

            _context.ChatMessages.Remove(message);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/files/{fileId}
        [HttpDelete("files/{fileId}")]
        public async Task<IActionResult> DeleteFile(string fileId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var file = await _context.Files.FindAsync(fileId);
            if (file == null) return NotFound("File not found");

            _context.Files.Remove(file);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/files/comment/{commentId}
        [HttpDelete("files/comment/{commentId}")]
        public async Task<IActionResult> DeleteFileComment(string commentId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var comment = await _context.FileComments.FindAsync(commentId);
            if (comment == null) return NotFound("Comment not found");

            _context.FileComments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/diaries/{diaryId}
        [HttpDelete("diaries/{diaryId}")]
        public async Task<IActionResult> DeleteDiary(string diaryId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var diary = await _context.Diaries.FindAsync(diaryId);
            if (diary == null) return NotFound("Diary not found");

            _context.Diaries.Remove(diary);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/diaries/comment/{commentId}
        [HttpDelete("diaries/comment/{commentId}")]
        public async Task<IActionResult> DeleteDiaryComment(string commentId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var comment = await _context.DiaryComments.FindAsync(commentId);
            if (comment == null) return NotFound("Comment not found");

            _context.DiaryComments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/photos/{photoId}
        [HttpDelete("photos/{photoId}")]
        public async Task<IActionResult> DeletePhoto(string photoId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var photo = await _context.Photos.FindAsync(photoId);
            if (photo == null) return NotFound("Photo not found");

            _context.Photos.Remove(photo);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/admin/photos/comment/{commentId}
        [HttpDelete("photos/comment/{commentId}")]
        public async Task<IActionResult> DeletePhotoComment(string commentId)
        {
            if (!await IsAdminAsync()) return Forbid();

            var comment = await _context.PhotoComments.FindAsync(commentId);
            if (comment == null) return NotFound("Comment not found");

            _context.PhotoComments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
