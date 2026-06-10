using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GcmsSoc.API.Models
{
    public class ForumCategory
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string Description { get; set; } = string.Empty;

        public List<ForumTopic> Topics { get; set; } = new();
    }

    public class ForumTopic
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ForumCategoryId { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Author { get; set; } = string.Empty;

        [Required]
        [MaxLength(25)]
        public string Date { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        public int Views { get; set; }

        public List<ForumPost> Posts { get; set; } = new();
    }

    public class ForumPost
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ForumTopicId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Avatar { get; set; } = string.Empty;

        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        [MaxLength(25)]
        public string Date { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        public List<ForumPostLike> Likes { get; set; } = new();
    }

    public class ForumPostLike
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ForumPostId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;
    }
}
