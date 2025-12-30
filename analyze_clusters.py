#!/usr/bin/env python3
"""
Analyze Seoul Street Cluster Data

Generates descriptive statistics for the entire Seoul dataset:
- Total street segments count
- Cluster distribution (count and percentage)
- Average characteristics by cluster
"""

import json
import sys

def analyze_ndjson(file_path='assets/data/clustered_k6.ndjson'):
    """
    Analyze NDJSON cluster data

    Returns:
        dict: Statistics including total count, cluster distribution, etc.
    """
    cluster_counts = {}
    total_segments = 0

    print("Reading NDJSON data...")

    try:
        with open(file_path, 'r') as f:
            for line in f:
                if not line.strip():
                    continue

                feature = json.loads(line)
                cluster = feature['properties']['cluster']

                cluster_counts[cluster] = cluster_counts.get(cluster, 0) + 1
                total_segments += 1

        print(f"✓ Analyzed {total_segments:,} street segments")

    except FileNotFoundError:
        print(f"✗ Error: {file_path} not found")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error reading file: {e}")
        sys.exit(1)

    # Calculate percentages
    cluster_distribution = {}
    for cluster, count in sorted(cluster_counts.items()):
        percentage = (count / total_segments) * 100
        cluster_distribution[cluster] = {
            'count': count,
            'percentage': round(percentage, 2)
        }

    # Build statistics
    stats = {
        'total_segments': total_segments,
        'cluster_distribution': cluster_distribution,
        'num_clusters': len(cluster_counts)
    }

    return stats

def load_cluster_profiles(file_path='assets/data/cluster_profiles.json'):
    """Load cluster characteristic profiles"""
    try:
        with open(file_path, 'r') as f:
            profiles = json.load(f)
        return profiles
    except Exception as e:
        print(f"✗ Error loading profiles: {e}")
        return []

def generate_summary_stats():
    """Generate comprehensive statistics for Seoul streets"""

    # Analyze NDJSON data
    stats = analyze_ndjson()

    # Load cluster profiles
    profiles = load_cluster_profiles()

    # Calculate weighted averages for Seoul overall
    total = stats['total_segments']
    weighted_chars = {
        'building': 0,
        'sidewalk': 0,
        'road': 0,
        'tree': 0,
        'sky': 0,
        'person': 0
    }

    for profile in profiles:
        cluster = profile['cluster']
        if cluster in stats['cluster_distribution']:
            weight = stats['cluster_distribution'][cluster]['count'] / total

            for char in weighted_chars.keys():
                weighted_chars[char] += profile[char] * weight

    # Round to 2 decimals
    for char in weighted_chars:
        weighted_chars[char] = round(weighted_chars[char], 2)

    # Build final output
    output = {
        'total_segments': stats['total_segments'],
        'num_clusters': stats['num_clusters'],
        'cluster_distribution': stats['cluster_distribution'],
        'seoul_average_characteristics': weighted_chars
    }

    return output

def main():
    print("=" * 60)
    print("Seoul Street Cluster Analysis")
    print("=" * 60)
    print()

    # Generate statistics
    stats = generate_summary_stats()

    # Save to JSON
    output_file = 'assets/data/seoul_stats.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    print(f"✓ Statistics saved to {output_file}")
    print()

    # Print summary
    print("=" * 60)
    print("SUMMARY:")
    print("=" * 60)
    print(f"Total Street Segments: {stats['total_segments']:,}")
    print(f"Number of Clusters: {stats['num_clusters']}")
    print()

    print("Cluster Distribution:")
    print("-" * 60)
    for cluster, data in sorted(stats['cluster_distribution'].items()):
        count = data['count']
        pct = data['percentage']
        bar_length = int(pct / 2)  # Scale for display
        bar = '█' * bar_length
        print(f"Cluster {cluster}: {count:>6,} ({pct:>5.1f}%)  {bar}")

    print()
    print("Seoul Average Characteristics (Weighted):")
    print("-" * 60)
    chars = stats['seoul_average_characteristics']
    for char, value in chars.items():
        bar_length = int(value * 30)  # Scale 0-1 to 0-30
        bar = '█' * bar_length
        print(f"{char.capitalize():>10}: {value:.2f}  {bar}")

    print()
    print("=" * 60)

if __name__ == '__main__':
    main()
