using Microsoft.EntityFrameworkCore;
using GcmsSoc.API.Models;

namespace GcmsSoc.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<NewsItem> News => Set<NewsItem>();
        public DbSet<NewsComment> NewsComments => Set<NewsComment>();
        public DbSet<ForumCategory> ForumCategories => Set<ForumCategory>();
        public DbSet<ForumTopic> ForumTopics => Set<ForumTopic>();
        public DbSet<ForumPost> ForumPosts => Set<ForumPost>();
        public DbSet<ForumPostLike> ForumPostLikes => Set<ForumPostLike>();
        public DbSet<ChatRoom> ChatRooms => Set<ChatRoom>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<FileItem> Files => Set<FileItem>();
        public DbSet<FileComment> FileComments => Set<FileComment>();
        public DbSet<Diary> Diaries => Set<Diary>();
        public DbSet<DiaryComment> DiaryComments => Set<DiaryComment>();
        public DbSet<PhotoItem> Photos => Set<PhotoItem>();
        public DbSet<PhotoLike> PhotoLikes => Set<PhotoLike>();
        public DbSet<PhotoComment> PhotoComments => Set<PhotoComment>();
        public DbSet<LibraryArticle> Library => Set<LibraryArticle>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ensure Cascade Delete behavior or configure indexes if needed
            modelBuilder.Entity<NewsComment>()
                .HasOne<NewsItem>()
                .WithMany(n => n.Comments)
                .HasForeignKey(c => c.NewsItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ForumTopic>()
                .HasOne<ForumCategory>()
                .WithMany(c => c.Topics)
                .HasForeignKey(t => t.ForumCategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ForumPost>()
                .HasOne<ForumTopic>()
                .WithMany(t => t.Posts)
                .HasForeignKey(p => p.ForumTopicId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ForumPostLike>()
                .HasOne<ForumPost>()
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.ForumPostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChatMessage>()
                .HasOne<ChatRoom>()
                .WithMany(r => r.Messages)
                .HasForeignKey(m => m.ChatRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FileComment>()
                .HasOne<FileItem>()
                .WithMany(f => f.Comments)
                .HasForeignKey(c => c.FileItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DiaryComment>()
                .HasOne<Diary>()
                .WithMany(d => d.Comments)
                .HasForeignKey(c => c.DiaryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PhotoComment>()
                .HasOne<PhotoItem>()
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PhotoItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PhotoLike>()
                .HasOne<PhotoItem>()
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.PhotoItemId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
